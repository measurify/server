# Define the Base Resources

A common IoT application is generally characterized by a few key entities, such as Things and Devices. Measurify enforces this paradigm and allows users to build their applications by defining these entities. Additionally, Measurify supports experiment tracking through two dedicated resources: Protocols and Experiments.

The available resources to define your applications are:

- **Tags**: Labels that can be applied to any entity inside Measurify.
- **Things**: A Thing represents the subject of a Measurement (e.g., House, Car, etc.).
- **Features**: The data types of your application; each Feature contains a list of items defining a schema to which Measurements comply.
- **Devices**: A Device is the tool (hardware or software) that collects Measurements.
- **Measurements**: Measurements are the data collected by Devices, where each Measurement is related to a specific subject (Thing) and follows the schema defined by a Feature. Every Measurement refers to a single Feature.
- **Protocols**: A Protocol specifies the type of Experiment. An Experiment must be associated with a Protocol that defines all the information (e.g., descriptors, metadata, indicators, and their relevant types) that will be recorded for that experiment. The Protocol does not define the values for that information, but only names and types.
- **Experiments**: An Experiment keeps track of the progress of the test of interest. It is associated with a Protocol that defines all the recorded fields and the list of Metadata (static information).

The following sections may appear similar since the GUI is designed to be consistent while performing similar tasks (e.g., creating Tags, Things, etc.). Nevertheless, these sections will serve as reminders on how to perform specific operations.

## Create a Tag

1.  To access the Tags page, click on the `Tags` link in the left sidebar.

2.  From this page, you can view the list of Tags and manage them (i.e., delete a Tag).

3.  To create a new Tag, click on the `+` button at the top of the page. Here you can specify:

    - **\_id**: The name of the Tag.
    - **tags**: The list of tags with which the Tag has been tagged. Tags must be already defined to be associated with this entity.

4.  Once you've provided all the relevant information, click the `Submit` button to create the Tag.

## Create a Thing

1.  To access the Things page, click on the `Things` link in the left sidebar.

2.  From this page, you can view the list of Things and manage them (i.e., delete a Thing).

3.  To create a new Thing, click on the `+` button at the top of the page. Here you can specify:

    - **\_id**: The name of the Thing.
    - **visibility**: The visibility of the Thing; public makes it accessible to every user, private will make it visible only to users with the role that allows them to access it.
    - **tags**: The list of Tags with which the thing has been tagged. Tags must be already defined to be associated with this entity.

4.  Once you've provided all the relevant information, click the `Submit` button to create the Thing.

## Create a Feature

1.  To access the Features page, click on the `Features` link in the left sidebar.

2.  From this page, you can view the list of Features and manage them (i.e., delete a Feature).

3.  To create a new Feature, click on the `+` button at the top of the page. Here you can specify:

    - **\_id**: The name of the Feature.
    - **items**: The list of data types that Measurements of this Feature could contain. Each item is identified by a name, a type, a unit, a dimension (0 for scalar, 1 for arrays, 2 for matrices, etc.), and a range (if the type is Enum) which is the list of possible values for that enumerable.
    - **visibility**: The visibility of the Feature; public makes it accessible to every user, private will make it visible only to users with the role that allows them to access it.
    - **tags**: The list of tags with which the Feature has been tagged. Tags must be already defined to be associated with this entity.

4.  Once you've provided all the relevant information, click the `Submit` button to create the Feature.

    _Example: Suppose that you want to define a feature for your accelerometer, which provides you all three components of acceleration (x-axis, y-axis, z-axis). You may define your feature as:_

    - **\_id**: acceleration
    - **items**: a list of three items, in particular:
      1.  _name_: a-x, _type_: number, _unit_: m/s^2, _dimension_: 0
      2.  _name_: a-y, _type_: number, _unit_: m/s^2, _dimension_: 0
      3.  _name_: a-z, _type_: number, _unit_: m/s^2, _dimension_: 0
    - **visibility**: public
    - **tags**: none

## Create a Device

1.  To access the Devices page, click on the `Devices` link in the left sidebar.

2.  From this page, you can view the list of Devices and manage them (i.e., delete a Device).

3.  To create a new Device, click on the `+` button at the top of the page. Here you can specify:

    - **\_id**: The name of the Device.
    - **features**: The list of Features that can be recorded by this device. Each Feature must be already defined to be associated with this entity.

4.  Once you've provided all the relevant information, click the `Submit` button to create the Device.

## Go to part 4 of this guide: [Define Protocol and Experiment](experiment_and_protocol.md)
