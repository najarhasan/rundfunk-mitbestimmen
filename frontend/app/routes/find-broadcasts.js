import Ember from 'ember';
import RouteMixin from 'ember-cli-pagination/remote/route-mixin';
import ResetScrollPositionMixin from 'frontend/mixins/reset-scroll-position';
import RSVP from 'rsvp';


export default Ember.Route.extend(RouteMixin, ResetScrollPositionMixin, {
  intl: Ember.inject.service(),
  session: Ember.inject.service('session'),
  seed: Math.random(),

  queryParams: {
    sort: {
      refreshModel: true
    },
    q: {
      refreshModel: true
    },
    medium: {
      refreshModel: true
    },
    station: {
      refreshModel: true
    },
    page: {
      refreshModel: true
    }
  },

  model(params) {
    params.paramMapping = {
      total_pages: "total-pages"
    };
    params.seed = this.get('seed');
    params.filter = {
      medium: params.medium,
      station: params.station
    };
    return RSVP.hash({
      impressions: this.get('store').peekAll('impression'),
      broadcasts: this.findPaged('broadcast', params)
    });
  },
  afterModel(_, transition) {
    if (this.get('session').get('isAuthenticated') === false){
      const customDict = {
        networkOrEmail: {
          headerText: this.get('intl').t('find-broadcasts.auth0-lock.networkOrEmail.headerText'),
          smallSocialButtonsHeader: this.get('intl').t('find-broadcasts.auth0-lock.networkOrEmail.smallSocialButtonsHeader'),
          separatorText: this.get('intl').t('auth0-lock.networkOrEmail.separatorText'),
        },
      };
      transition.send('login', customDict, 'find-broadcasts');
    }
  },
  setupController: function(controller, model) {
    // Call _super for default behavior
    this._super(controller, model);
    // Implement your custom setup after
    controller.set('newBroadcast', this.store.createRecord('broadcast', {
      title: controller.get('q')
    }));
    controller.set('media', this.store.findAll('medium'));
    controller.set('stations', this.store.findAll('station'));
    controller.set('filterParams', {
      query: controller.get('q'),
      medium: controller.get('medium'),
      station: controller.get('station'),
      sort: controller.get('sort')
    });
  },
  resetController(controller, isExiting) {
    if (isExiting) {
      controller.set('q', null);
      controller.set('medium', null);
      controller.set('station', null);
      controller.set('sort', 'random');
    }
  },
  actions: {
    loading(transition) {
      let controller = this.controllerFor('find-broadcasts');
      controller.set('loading', 'loading');
      transition.promise.finally(function() {
        controller.set('loading', '');
      });
    },
    setQuery(filterParams){
      this.get('controller').set('sort', filterParams.sort);
      this.get('controller').set( 'q', filterParams.query);
      this.get('controller').set( 'medium', filterParams.medium);
      this.get('controller').set('station', filterParams.station);
    },
    newBroadcast(){
      this.get('controller').set('newBroadcast', this.store.createRecord('broadcast', {
      }));
    }
  }
});
