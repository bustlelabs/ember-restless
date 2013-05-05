/*
 * Adapter
 * Base adapter to be subclassed.
 * Handles fetching and saving data to persistence layer
 * and storing cofiguration options about all models.
 */
RESTless.Adapter = Ember.Object.extend({
  /*
   * serializer: Instance of a Serializer used to transform data
   * i.e. JSONSerializer or XMLSerializer
   */
  serializer: null,

  /* 
   * Common adapter methods that must be implemented in a subclass
   */
  saveRecord:   mustImplement('saveRecord'),
  deleteRecord: mustImplement('deleteRecord'),
  findAll:      mustImplement('findAll'),
  findByKey:    mustImplement('findByKey'),
  find:         mustImplement('find'), //alias to handle both findAll & findByKey

  /*
   * configurations: stores info about custom configurations
   * plurals - i.e. to set the plural resource name of 'person' to 'people'
   * models - to set a different primary key for a certain model type
   */
  configurations: Ember.Object.create({
    plurals: Ember.Object.create(),
    models: Ember.Map.create()
  }),

  /*
   * configure: helper method to set allowed configurations
   */
  configure: function(type, value) {
    var configs = this.get('configurations'),
        configForType = configs.get(type);
    if(configForType) {
      configs.set(type, $.extend(configForType, value));
    }
    return this;
  },

  /*
   * map: helper to map configurations for model types
   * examples:
   * App.RESTAdapter.map('App.Post', { primaryKey: 'slug' });
   * App.RESTAdapter.map('App.Person', { lastName: { key: 'lastNameOfPerson' } });
   */
  map: function(modelKey, config) {
    var modelMap = this.get('configurations.models'),
        modelConfig = modelMap.get(modelKey), 
        newConfig = {},
        configKey, propertyKeys, modifiedPropKey;

    for(configKey in config) {
      if(config.hasOwnProperty(configKey)) {
        if(config[configKey].hasOwnProperty('key')) {
          // If trying to set a custom property key
          // Transform and merge into a custom 'propertyKeys' hash to make lookup faster when deserializing
          propertyKeys = modelConfig && modelConfig.hasOwnProperty('propertyKeys') ? modelConfig.propertyKeys : {};
          modifiedPropKey = config[configKey].key;
          propertyKeys[modifiedPropKey] = configKey;
          newConfig.propertyKeys = propertyKeys;
        } else {
          newConfig[configKey] = config[configKey];
        }
        modelConfig = $.extend(modelConfig, newConfig);
      }
    }
    modelMap.set(modelKey, modelConfig);
    return this;
  }
});
