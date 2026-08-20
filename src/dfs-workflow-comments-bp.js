import { LitElement, html, css } from 'lit';
import { componentStyles } from './styles.js';
import { sendIcon, deleteIcon, expandIcon } from './icons.js';

const newId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`);

class CommentsElement extends LitElement {

  static get styles() {
    return [
      componentStyles,
      css`
        /* Modern Card Design with Shadows & Hover Effects */
        .comment-card {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          margin-bottom: 1rem;
          border-radius: 8px;
          overflow: hidden;
          animation: slideIn 0.3s ease-out;
        }

        .comment-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        }

        /* Slide-in Animation for New Comments */
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Enhanced Typography */
        .comment-text {
          line-height: 1.6;
          color: #2c3e50;
          font-size: 0.95rem;
          white-space: pre-wrap;
        }

        .comment-date {
          font-size: 0.85rem;
          font-weight: 500;
        }

        /* Visually hidden, still read by screen readers */
        .visually-hidden-label {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }

        @media (prefers-reduced-motion: reduce) {
          .comment-card {
            animation: none;
            transition: none;
          }
          .comment-card:hover {
            transform: none;
          }
        }
      `
    ];
  }

  static getMetaConfig() {
    return {
      controlName: 'dfs-workflow-comments-bp-v2',
      fallbackDisableSubmit: false,
      description: 'Notes and comments',
      iconUrl: 'https://bradpage.github.io/WebComponents/public/media/icons/icon.svg',
      groupName: 'DFS',
      version: '2.2',
      properties: {
        commentsBorder: {
          title: 'Show Border on comments',
          type: 'boolean',
          defaultValue: true,
        },
        commentsStriped: {
          title: 'Striped comments',
          type: 'boolean',
          defaultValue: true,
        },
        firstName: { type: 'string', title: 'First name' },
        lastName: { type: 'string', title: 'Last name' },
        email: { type: 'string', title: 'Email Address' },
        taskowner: { type: 'string', title: 'Task Owner' },
        badge: {
          type: 'string',
          description: 'Label for status badge e.g. Rejected, Approved, Return etc. Default blank value is Update',
          title: 'Badge',
        },
        badgeStyle: {
          type: 'string',
          description: 'Select the style for the badge from the dropdown based on Bootstrap 5 badge',
          title: 'Badge Style',
          enum: [
            'Default', 'Primary', 'Secondary', 'Success',
            'Danger', 'Warning', 'Info', 'Light', 'Dark',
          ],
          defaultValue: 'Default',
        },
        inputobj: {
          type: 'object',
          title: 'Input Object',
          description: 'Enter the comments object from previous control here',
        },
        historyLimit: {
          type: 'integer',
          title: 'Comment history display limit',
          description: 'Enter a number value of how many comments should be shown, older comments are hidden, entering 0 will show all comments, default is 5.',
          defaultValue: 5,
        },
        outputobj: {
          title: 'Comments Output',
          type: 'object',
          description: 'Workflow Comments Output Do Not Use',
          isValueField: true,
          properties: {
            comments: {
              type: 'object', // SWAP to 'object' to register, back to 'array' to run.
              description: 'Array of comments',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string', description: 'Comment identifier', title: 'Comment ID' },
                  firstName: { type: 'string', description: 'First Name', title: 'First Name' },
                  lastName: { type: 'string', description: 'Last Name', title: 'Last Name' },
                  email: { type: 'string', description: 'Email Address', title: 'Email Address' },
                  taskowner: { type: 'string', description: 'Task Owner', title: 'Task Owner' },
                  badge: { type: 'string', description: 'Badge Status', title: 'Badge Status' },
                  badgeStyle: { type: 'string', description: 'Badge Style', title: 'Badge Style' },
                  comment: { type: 'string', description: 'Comment', title: 'Comment' },
                  timestamp: { type: 'string', format: 'date-time', description: 'Log time', title: 'Log time' },
                },
              },
            },
            mostRecentComment: {
              type: 'object',
              description: 'Latest comment',
              properties: {
                id: { type: 'string', description: 'Comment identifier', title: 'Comment ID' },
                firstName: { type: 'string', description: 'First Name', title: 'First Name' },
                lastName: { type: 'string', description: 'Last Name', title: 'Last Name' },
                email: { type: 'string', description: 'Email Address', title: 'Email Address' },
                taskowner: { type: 'string', description: 'Task Owner', title: 'Task Owner' },
                badge: { type: 'string', description: 'Badge Status', title: 'Badge Status' },
                badgeStyle: { type: 'string', description: 'Badge Style', title: 'Badge Style' },
                comment: { type: 'string', description: 'Comment', title: 'Comment' },
                timestamp: { type: 'string', format: 'date-time', description: 'Log time', title: 'Log time' },
              },
            },
            newCommentAdded: {
              type: 'boolean',
              description: 'True when a new deletable comment exists. Use this in submission rules.',
              title: 'New Comment Added',
            },
          },
        },
      },
      events: ['ntx-value-change'],
      standardProperties: { fieldLabel: true, description: true, readOnly: true, visibility: true },
    };
  }

  static properties = {
    commentsBorder: { type: Boolean },
    commentsStriped: { type: Boolean },
    firstName: { type: String },
    lastName: { type: String },
    email: { type: String },
    taskowner: { type: String },
    badge: { type: String },
    badgeStyle: { type: String },
    inputobj: { type: Object },
    workingComments: { type: Array },
    newComment: { type: String },
    readOnly: { type: Boolean },
    historyLimit: { type: Number },
    showAll: { type: Boolean },
    outputobj: { type: Object },
    newCommentAdded: { type: Boolean },
    sessionIds: { type: Array },
  };

  constructor() {
    super();
    this.commentsBorder = true;
    this.commentsStriped = true;
    this.firstName = '';
    this.lastName = '';
    this.email = '';
    this.taskowner = '';
    this.badge = 'Update';  // Default Badge
    this.badgeStyle = 'Default';  // Default Badge Style
    this.inputobj = null;
    this.workingComments = [];
    this.newComment = '';
    this.historyLimit = 5;
    this.showAll = false;
    this.newCommentAdded = false;
    this.sessionIds = [];
    this._hydrated = false;
  }

  toggleShowAll() {
    this.showAll = !this.showAll;
  }

  updated(changedProperties) {
    // Hydrate once, from whichever source arrives. Guarding on _hydrated stops
    // a late or repeated assignment from wiping comments the user has already
    // posted in this session.
    if (!this._hydrated) {
      // Path 1: comments handed in from a previous control in the workflow.
      if (changedProperties.has('inputobj') && Array.isArray(this.inputobj?.comments)) {
        this.hydrate(this.inputobj.comments);
      }
      // Path 2: a submitted form being viewed again. Nintex returns the stored
      // value rather than inputobj, so restore from our own output.
      else if (changedProperties.has('outputobj') && Array.isArray(this.outputobj?.comments)) {
        this.hydrate(this.outputobj.comments);
      }
    }

    if (changedProperties.has('commentsBorder') || changedProperties.has('commentsStriped')) {
      this.requestUpdate();
    }

    if (changedProperties.has('readOnly')) {
      this.requestUpdate();
    }
  }


  hydrate(comments) {
    this._hydrated = true;
    const mine = this.workingComments.filter((entry) => this.sessionIds.includes(entry.id));
    const inherited = comments.map((entry) => ({ ...entry, id: entry.id || newId() }));
    this.workingComments = [...inherited, ...mine];
    this.updateOutput();
  }

  updateOutput() {
    const hasNew = this.sessionIds.length > 0;
    this.newCommentAdded = hasNew;

    this.outputobj = {
      comments: this.workingComments,
      mostRecentComment: this.workingComments[this.workingComments.length - 1] || null,
      newCommentAdded: hasNew,
    };

    this.dispatchEvent(new CustomEvent('ntx-value-change', {
      detail: this.outputobj,
      bubbles: true,
      composed: true,
    }));
  }

  addComment() {
    const text = this.newComment.trim();
    if (!text) return;

    const entry = {
      id: newId(),
      firstName: this.firstName || 'Anonymous',
      lastName: this.lastName || '',
      email: this.email || 'N/A',
      taskowner: this.taskowner || '',
      badge: this.badge || 'Update',
      badgeStyle: this.badgeStyle || 'Default',
      comment: text,
      timestamp: new Date().toISOString(),
    };

    this.workingComments = [...this.workingComments, entry];
    this.sessionIds = [...this.sessionIds, entry.id];
    this.newComment = '';
    this.updateOutput();
  }

  deleteComment(id) {
    if (this.readOnly || !this.sessionIds.includes(id)) return;

    this.workingComments = this.workingComments.filter((entry) => entry.id !== id);
    this.sessionIds = this.sessionIds.filter((sessionId) => sessionId !== id);
    this.updateOutput();
  }

  handleCommentChange(e) {
    this.newComment = e.target.value;
  }

  // Helper method to get border color based on badge style
  getBorderColor(badgeStyle) {
    const colors = {
      Success: '#198754',
      Danger: '#dc3545',
      Warning: '#ffc107',
      Info: '#0dcaf0',
      Primary: '#247b7b',
      Secondary: '#6c757d',
      Default: '#247b7b'
    };
    return colors[badgeStyle] || colors.Default;
  }

  render() {
    const showAllComments = this.historyLimit === 0 || this.showAll;
    const displayedComments = showAllComments
      ? this.workingComments
      : this.workingComments.slice(-this.historyLimit);

    const commentsHistoryClasses = [
      this.commentsBorder ? 'comments-border' : '',
      this.commentsStriped ? 'comments-striped' : ''
    ].filter(Boolean).join(' ');

    return html`
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.2.3/dist/css/bootstrap.min.css" rel="stylesheet" />

      <!-- Show "Show All Comments" button if there are more comments than the limit -->
      ${this.historyLimit > 0 && this.workingComments.length > this.historyLimit ? html`
        <div class="d-flex justify-content-center mb-3">
          <button
            class="btn btn-default rounded-pill d-flex align-items-center"
            type="button"
            aria-expanded=${this.showAll ? 'true' : 'false'}
            @click=${this.toggleShowAll}
          >
            ${expandIcon}
            <div class="ms-1">
            ${this.showAll ? ' Hide All Comments' : ' Show All Comments'}
            </div>
          </button>
        </div>
      ` : ''}

      <!-- Display the comments with applied styles -->
      ${displayedComments.length > 0 ? html`
        <div class="comments-history ${commentsHistoryClasses}">
          ${displayedComments.map((item) => html`
            <div class="card comment-card shadow-sm" style="border-left: 4px solid ${this.getBorderColor(item.badgeStyle)}">
              <div class="card-body">
                <div class="d-flex flex-row align-items-center gap-2">
                  <h6 class="fw-bold mb-0">
                    <span class="me-1" aria-hidden="true">👤</span>${item.firstName} ${item.lastName || ''}
                  </h6>
                  ${item.taskowner ? html`
                    <span class="badge bg-secondary rounded-pill">
                      <span class="me-1" aria-hidden="true">👔</span>${item.taskowner}
                    </span>
                  ` : ''}
                  <span class="badge ${this.getBadgeClass(item.badgeStyle) || 'Default'} rounded-pill">
                    ${item.badge || 'Update'}
                  </span>
                  ${this.sessionIds.includes(item.id) && !this.readOnly ? html`
                    <button
                      class="btn btn-sm btn-danger ms-auto"
                      type="button"
                      aria-label="Delete your comment"
                      title="Delete your comment"
                      @click=${() => this.deleteComment(item.id)}
                    >
                      ${deleteIcon}
                    </button>
                  ` : ''}
                </div>
                <div class="d-flex flex-row align-items-center mt-1">
                  <p class="mb-0 text-muted comment-date">
                    <span class="me-1" aria-hidden="true">🕒</span>
                    ${new Date(item.timestamp).toLocaleString('en-GB', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: false,
                    })}
                  </p>
                </div>
                <div>
                  <p class="mb-0 py-3 comment-text">${item.comment}</p>
                </div>
              </div>
            </div>
          `)}
        </div>
      ` : html``}

      ${!this.readOnly ? html`
        <div class="mt-4">
          <label class="visually-hidden-label" for="new-comment">Write your comment</label>
          <textarea
            id="new-comment"
            class="comment-textarea"
            .value=${this.newComment}
            @input=${this.handleCommentChange}
            placeholder="✍️ Write your comment here..."
          ></textarea>
          <button
            class="btn btn-default d-flex align-items-center"
            type="button"
            @click=${this.addComment}
            ?disabled=${!this.newComment.trim()}
          >
            ${sendIcon} Post Comment to Workflow
          </button>
        </div>
      ` : ''}

      <p class="visually-hidden-label" role="status" aria-live="polite">
        ${this.newCommentAdded ? 'Comment posted to workflow.' : ''}
      </p>
    `;
  }

  getBadgeClass(style) {
    const badgeClasses = {
      Default: 'badge badge-default',
      Primary: 'badge bg-primary text-white',
      Secondary: 'badge bg-secondary text-white',
      Success: 'badge bg-success text-white',
      Danger: 'badge bg-danger text-white',
      Warning: 'badge bg-warning text-dark',
      Info: 'badge bg-info',
      Light: 'badge bg-light text-dark',
      Dark: 'badge bg-dark text-white',
    };

    return badgeClasses[style] || badgeClasses.Default;
  }
}

customElements.define('dfs-workflow-comments-bp-v2', CommentsElement);
