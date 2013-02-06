(function() {

  var Group = Two.Group = function(o) {

    Two.Shape.call(this);

    delete this.stroke;
    delete this.fill;
    delete this.linewidth;
    delete this.opacity;

    delete this.cap;
    delete this.join;
    delete this.miter;

    this.children = {};

  };

  _.extend(Group, {

  });

  _.extend(Group.prototype, Two.Shape.prototype, {

    add: function(o) {

      var l = arguments.length,
        objects = o,
        children = this.children,
        grandparent = this.parent,
        ids = [];

      if (!_.isArray(o)) {
        objects = _.toArray(arguments);
      }

      // A bubbled up version of 'change' event for the children.

      var broadcast = _.bind(function(id, property, value, closed, curved) {
        this.trigger(Two.Events.change, id, property, value, closed, curved);
      }, this);

      // Add the objects

      _.each(objects, function(object) {

        var id = object.id, parent = object.parent;

        if (_.isUndefined(id)) {
          grandparent.add(object);
          id = object.id;
        }

        if (_.isUndefined(children[id])) {
          // Release object from previous parent.
          if (parent) {
            delete parent.children[id];
          }
          // Add it to this group and update parent-child relationship.
          children[id] = object;
          object.parent = this;
          object.unbind(Two.Events.change)
            .bind(Two.Events.change, broadcast);
          ids.push(id);
        }

      }, this);

      if (ids.length > 0) {
        this.trigger(Two.Events.change, this.id, 'hierarchy', ids);
      }

      return this;

    },

    getBoundingClientRect: function() {

      var left = Infinity, right = -Infinity, top = Infinity, bottom = -Infinity;
      var x = this.translation.x, y = this.translation.y;
      var scale = this.scale;

      _.each(this.children, function(child) {

        var rect = child.getBoundingClientRect();

        top = Math.min(rect.top, top);
        left = Math.min(rect.left, left);
        right = Math.max(rect.right, right);
        bottom = Math.max(rect.bottom, bottom);

      }, this);

      top *= scale;
      left *= scale;
      right *= scale;
      bottom *= scale;

      top += y;
      left += x;
      right += x;
      bottom += y;

      return {
        top: top,
        left: left,
        right: right,
        bottom: bottom,
        width: right - left,
        height: bottom - top
      };

    }

  });

})();