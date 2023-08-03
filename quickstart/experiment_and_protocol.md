# Experiment Progress tracking

As introduced before, Measurify offers a way to track the progress of experiments. In particular, the experiments tracking relies on two resources, which are:

- **Protocols**: A Protocol specifies the type of Experiment. An Experiment must be associated with a Protocol that defines all the information (e.g., descriptors, metadata, indicators, and their relevant types) that will be recorded for that experiment. The Protocol does not define the values for that information, but only names and types.
- **Experiments**: An Experiment keeps track of the progress of the test of interest. It is associated with a Protocol that defines all the recorded fields and the list of Metadata (static information). Each experiments embeds informations about the progress into its History field. History is composed of Steps. Each Step has a series of fields defined by the corresponding Protocol's Topics.

## Create a Protocol

1.  To access the Protocols page, click on the `Protocols` link in the left sidebar.

2.  From this page, you can view the list of Protocols and manage them (i.e., delete a Protocol).

3.  To create a new Protocol, click on the `+` button at the top of the page. Here you can specify:

    - **\_id**: The name of the Tag.
    - **description**: The short description of the Protocol.
    - **metadata**: The metadata list defined by the Protocol. This is the list of static informations that each Experiment associated with this protocol could manage. Here you can specify the name, the description and the type of metadata.
    - **topics**: The topic list defined by the Protocol. This is the list of dynamic informations that each Experiment associated with this protocol could store in its History. Here you can specify the name of the topic, the description and the list of fields for this topic. Each protocol could include more than one topic. In this way you can have a hierarchical structure of fields in the Protocol.

4.  Once you've provided all the relevant information, click the `Submit` button to create the Protocol.

## Create an Experiment

1.  To access the Experiments page, click on the `Experiments` link in the left sidebar.

2.  From this page, you can view the list of Experiments and manage them (i.e., delete a Experiments).

3.  To create a new Experiment, click on the `+` button at the top of the page. Here you can specify:

    - **select protocol**: Select the Protocol associated with the Experiment; once you select it the corresponding metadata list will be shown.
    - **\_id**: The name of the Experiment.
    - **description**: The short description of the Experiment.
    - **state**: The state of the Experiment, 0 for ongoing, 1 for finished.
    - **startDate**: The start date of the Experiment, use yyyy/mm/dd formatting.
    - **endDate**: The end date of the Experiment, use yyyy/mm/dd formatting.
    - **manager**: The person or group that manages the Experiment.
    - **place**: The place where the Experiment is located.
    - **metadata**: The metadata list defined by the Protocol. This is the list of static informations about the Experiment . Here you can specify the values for each Metadata.

4.  Once you've provided all the relevant information, click the `Submit` button to create the Experiment.
