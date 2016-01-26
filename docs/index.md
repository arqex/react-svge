## You are a real developer!
This is the dev docs for *react-svge*. Since this is a React component build by the community, this docs tries to make easier to know the internals of the component and what and how to modify them in order to push it forward.

react-svge wants to be a complete vector editor that can be included in any react app.

react-svge is a work in progress. There is a list of desired features for the project where you can pick one, and start helping to build the component.

It is composed by 3 different components:

1. SvgEditor is the main component. It is a canvas where the edition of the vectors happens. You can create poligons, edit paths or remove elements from a vector image using it.

2. ToolBar. SvgEditor component behaviour depends on the mode it is working. In `path` mode you can create new paths, in `select` mode you can move, delete or group elements... The ToolBar components is a button container that changes the mode of the SvgEditor. Different modes can be, `path`, `select`, `rectangle`, `circle`...

3. PropertiesBar. Allows to edit the options of a particular mode. For example, when drawing a circle, you may want to have a red border with a blue fill. PropertiesBar provides a simple UI to let the user customize the vector elements.

The use of ToolBar and PropertiesBar in not mandatory. SvgEditor should offer a nice API that allow the developers to create their own way of change modes and properties.
