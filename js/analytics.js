(function () {
  function reportTrackingError(operation, error) {
    var message = error instanceof Error ? error.message : String(error);
    if (window.console && typeof window.console.error === 'function') {
      window.console.error('[Dental Health] ' + operation + ': ' + message);
    }
  }

  function trackContact(method) {
    if (typeof window.fbq === 'function') {
      try {
        window.fbq('track', 'Contact');
      } catch (error) {
        reportTrackingError('reporting Facebook contact event', error);
      }
    } else {
      reportTrackingError('reporting Facebook contact event', new Error('Facebook pixel is unavailable'));
    }

    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'contact_click', {
          send_to: 'analytics',
          method: method
        });
      } catch (error) {
        reportTrackingError('reporting Analytics contact event', error);
      }
    } else {
      reportTrackingError('reporting Analytics contact event', new Error('Google tag is unavailable'));
    }
  }

  function trackViewContent(element) {
    var contentType = element.getAttribute('data-track-view-content');
    var contentName = element.getAttribute('data-track-view-name');
    if (!contentType || !contentName) return;

    if (typeof window.fbq === 'function') {
      try {
        window.fbq('track', 'ViewContent', {
          content_name: contentName,
          content_type: contentType
        });
      } catch (error) {
        reportTrackingError('reporting Facebook view event', error);
      }
    } else {
      reportTrackingError('reporting Facebook view event', new Error('Facebook pixel is unavailable'));
    }

    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'view_content', {
          send_to: 'analytics',
          content_type: contentType,
          content_name: contentName
        });
      } catch (error) {
        reportTrackingError('reporting Analytics view event', error);
      }
    } else {
      reportTrackingError('reporting Analytics view event', new Error('Google tag is unavailable'));
    }
  }

  function init() {
    document.addEventListener('click', function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== 'function') return;
      var link = target.closest('[data-track-contact]');
      if (link) trackContact(link.getAttribute('data-track-contact'));
    });

    var viewContent = document.querySelector('[data-track-view-content]');
    if (viewContent) trackViewContent(viewContent);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
