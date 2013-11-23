/**
 * Copyright (c) 2013 Azeem Arshad
 * See the file license.txt for copying permission.
 */

CanvasTestWithFM("Effectlist Code", 2, function(canvas, gl, fm, copier) {
    var main = new DummyMain(canvas, copier);
    var parent = new DummyParent(fm);

    var el = new Webvs.EffectList(gl, main, parent, {
        code: {
            init: "counter = 1;",
            perFrame: "counter=counter+1;enabled=counter%2;"
        },
        components: [
            {
                type: "ClearScreen",
                color: "#ff0000"
            }
        ]
    });

    fm.setRenderTarget();
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    el.draw();
    fm.restoreRenderTarget();
    copier.run(null, null, fm.getCurrentTexture());
    imageFuzzyOk(
        "Effectlist code test: no rendering the first time", gl, canvas,
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABbUlEQVR4Xu3TsQkAMAzEQHv/oZMUGULFGdwLid+ZOe9dxMAKEinxMQRp9RhBBIkZiOFYiCAxAzEcCxEkZiCGYyGCxAzEcCxEkJiBGI6FCBIzEMOxEEFiBmI4FiJIzEAMx0IEiRmI4ViIIDEDMRwLESRmIIZjIYLEDMRwLESQmIEYjoUIEjMQw7EQQWIGYjgWIkjMQAzHQgSJGYjhWIggMQMxHAsRJGYghmMhgsQMxHAsRJCYgRiOhQgSMxDDsRBBYgZiOBYiSMxADMdCBIkZiOFYiCAxAzEcCxEkZiCGYyGCxAzEcCxEkJiBGI6FCBIzEMOxEEFiBmI4FiJIzEAMx0IEiRmI4ViIIDEDMRwLESRmIIZjIYLEDMRwLESQmIEYjoUIEjMQw7EQQWIGYjgWIkjMQAzHQgSJGYjhWIggMQMxHAsRJGYghmMhgsQMxHAsRJCYgRiOhQgSMxDDsRBBYgZiOBYiSMxADMdCYkEuN71kAdKuUAcAAAAASUVORK5CYII="
    );

    fm.setRenderTarget();
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    el.draw();
    fm.restoreRenderTarget();
    copier.run(null, null, fm.getCurrentTexture());
    imageFuzzyOk(
      "Effectlist code test: red cleared screen the second time", gl, canvas,
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABbUlEQVR4Xu3V0QkAIAzE0Hb/oVVwifcR6QAh4XDPzLueYmALoqT4HAWxehQE61GQgmgGMJ7+kIJgBjCcFlIQzACG00IKghnAcFpIQTADGE4LKQhmAMNpIQXBDGA4LaQgmAEMp4UUBDOA4bSQgmAGMJwWUhDMAIbTQgqCGcBwWkhBMAMYTgspCGYAw2khBcEMYDgtpCCYAQynhRQEM4DhtJCCYAYwnBZSEMwAhtNCCoIZwHBaSEEwAxhOCykIZgDDaSEFwQxgOC2kIJgBDKeFFAQzgOG0kIJgBjCcFlIQzACG00IKghnAcFpIQTADGE4LKQhmAMNpIQXBDGA4LaQgmAEMp4UUBDOA4bSQgmAGMJwWUhDMAIbTQgqCGcBwWkhBMAMYTgspCGYAw2khBcEMYDgtpCCYAQynhRQEM4DhtJCCYAYwnBZSEMwAhtNCCoIZwHBaSEEwAxhOCykIZgDDaSEFwQxgOC2kIJgBDOcCFY7HnQ4xRsoAAAAASUVORK5CYII="
    );

    el.destroy();
});

CanvasTestWithFM("EffectList EnableOnBeat", 2, function(canvas, gl, fm, copier) {
    var main = new DummyMain(canvas, copier);
    var parent = new DummyParent(fm);

    var el = new Webvs.EffectList(gl, main, parent, {
        enableOnBeat: true,
        enableOnBeatFor: 2,
        output: "AVERAGE",
        components: [
            {
                type: "ClearScreen",
                color: "#ff0000"
            }
        ]
    });

    fm.setRenderTarget();
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    el.draw();
    fm.restoreRenderTarget();
    copier.run(null, null, fm.getCurrentTexture());
    imageFuzzyOk(
        "Effectlist enableOnBeatFor: should'nt render when there is no beat", gl, canvas,
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABbUlEQVR4Xu3TsQkAMAzEQHv/oZMUGULFGdwLid+ZOe9dxMAKEinxMQRp9RhBBIkZiOFYiCAxAzEcCxEkZiCGYyGCxAzEcCxEkJiBGI6FCBIzEMOxEEFiBmI4FiJIzEAMx0IEiRmI4ViIIDEDMRwLESRmIIZjIYLEDMRwLESQmIEYjoUIEjMQw7EQQWIGYjgWIkjMQAzHQgSJGYjhWIggMQMxHAsRJGYghmMhgsQMxHAsRJCYgRiOhQgSMxDDsRBBYgZiOBYiSMxADMdCBIkZiOFYiCAxAzEcCxEkZiCGYyGCxAzEcCxEkJiBGI6FCBIzEMOxEEFiBmI4FiJIzEAMx0IEiRmI4ViIIDEDMRwLESRmIIZjIYLEDMRwLESQmIEYjoUIEjMQw7EQQWIGYjgWIkjMQAzHQgSJGYjhWIggMQMxHAsRJGYghmMhgsQMxHAsRJCYgRiOhQgSMxDDsRBBYgZiOBYiSMxADMdCYkEuN71kAdKuUAcAAAAASUVORK5CYII="
    );

    fm.setRenderTarget();
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    for(var i = 0;i < 10;i++) {
        if(i == 5) {
            main.analyser.beat = true;
        } else {
            main.analyser.beat = false;
        }
        el.draw();
    }
    fm.restoreRenderTarget();
    copier.run(null, null, fm.getCurrentTexture());
    imageFuzzyOk(
        "Effectlist enableOnBeatFor: should render for 2 frames", gl, canvas,
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAABbUlEQVR4Xu3VUQkAMAzE0Na/qEnbYCry8aogJBzdM3PHZQysIJkWH0SQVg9BYj0EEaRmIMbjhwgSMxDDsRBBYgZiOBYiSMxADMdCBIkZiOFYiCAxAzEcCxEkZiCGYyGCxAzEcCxEkJiBGI6FCBIzEMOxEEFiBmI4FiJIzEAMx0IEiRmI4ViIIDEDMRwLESRmIIZjIYLEDMRwLESQmIEYjoUIEjMQw7EQQWIGYjgWIkjMQAzHQgSJGYjhWIggMQMxHAsRJGYghmMhgsQMxHAsRJCYgRiOhQgSMxDDsRBBYgZiOBYiSMxADMdCBIkZiOFYiCAxAzEcCxEkZiCGYyGCxAzEcCxEkJiBGI6FCBIzEMOxEEFiBmI4FiJIzEAMx0IEiRmI4ViIIDEDMRwLESRmIIZjIYLEDMRwLESQmIEYjoUIEjMQw7EQQWIGYjgWIkjMQAzHQgSJGYjhWIggMQMxHAsRJGYghmMhgsQMxHAeJCiunQjq6P4AAAAASUVORK5CYII="
    );
});
