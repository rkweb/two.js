(function() {

  // Localized variables
  var zero = Two.Vector.zero, clone;

  var Shape = Two.Shape = function(limited) {

    // Private object for renderer specific variables.
    this._renderer = {};

    this.id = Two.Identifier + Two.uniqueId();

    // Define matrix properties which all inherited
    // objects of Shape have.

    this._matrix = new Two.Matrix();

    this.translation = new Two.Vector();
    this.translation.bind(Two.Events.change, _.bind(Shape.FlagMatrix, this));
    this.rotation = 0;
    this.scale = 1;

  };

  _.extend(Shape, Backbone.Events, {

    FlagMatrix: function() {
      this._flagMatrix = true;
    },

    MakeObservable: function(object) {

      Object.defineProperty(object, 'rotation', {
        get: function() {
          return this._rotation;
        },
        set: function(v) {
          this._rotation = v;
          this._flagMatrix = true;
        }
      });

      Object.defineProperty(object, 'scale', {
        get: function() {
          return this._scale;
        },
        set: function(v) {
          this._scale = v;
          this._flagMatrix = true;
          this._flagScale = true;
        }
      });

      Object.defineProperty(object, 'clip', {
        get: function() {
          return this._clip;
        },
        set: function(v) {
          this._clip = v;
          this._flagClip = true;
        }
      });

      Object.defineProperty(object, 'mask', {
        get: function() {
          return this._mask;
        },
        set: function(v) {
          this._mask = v;
          this._flagMask = true;
          if (!v.clip) {
            v.clip = true;
          }
        }
      });

    }

  });

  _.extend(Shape.prototype, {

    // Flags

    _flagMatrix: true,

    _flagMask: false,
    _flagClip: false,

    // Underlying Properties

    _rotation: 0,
    _scale: 1,

    _mask: null,
    _clip: false,

    addTo: function(group) {
      group.add(this);
      return this;
    },

    clone: function() {
      clone = new Shape();
      clone.translation.copy(this.translation);
      clone.rotation = this.rotation;
      clone.scale = this.scale;
      _.each(Shape.Properties, function(k) {
        clone[k] = this[k];
      }, this);
      return clone._update();
    },

    /**
     * To be called before render that calculates and collates all information
     * to be as up-to-date as possible for the render. Called once a frame.
     */
    _update: function() {

      if (!this._matrix.manual && this._flagMatrix) {

        this._matrix
          .identity()
          .translate(this.translation.x, this.translation.y)
          .scale(this.scale)
          .rotate(this.rotation);

      }

      // Bubble up to parents mainly for `getBoundingClientRect` method.
      if (this.parent && _.isFunction(this.parent._update)) {
        this.parent._update();
      }

      return this;

    },

    flagReset: function() {

      this._flagMatrix = this._flagScale = this._flagClip = this._flagMask = false;

      return this;

    }

  });

  Shape.MakeObservable(Shape.prototype);

})();
