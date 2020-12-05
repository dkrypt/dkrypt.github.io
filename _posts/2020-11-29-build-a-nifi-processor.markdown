---
layout: post
title: Building a NiFi Processor
show_sidebar: false
image: output8.png
summary: |-
    This post descibes the process to code a NiFi Processor in Java. It details on lifecycle of the processor and explanation about various methods.
---
### [Project Repository (GitHub)]()

# What is Apache NiFi
Apache NiFi is a robust, powerful and reliable system to process and distribute data in real time. It has an intuitive UI with simple drag-n-drop feature, which helps to create data flows. A NiFi flow is a collection of processors connected with defined relationships to handle success and failure. Each processor acts as a single unit to either ingest, transform or distribute the data. The data unit in NiFi is called **FlowFile**. A FlowFile can be considerd as a file which has some metadata like **filename**, **uuid** and some **attributes** which are attached to FlowFile by each processor according to the process it does.

# What is a NiFi Processor
NiFi is built around Flow Based Programming. Meaning, the data flows from one end to the other and all the transformation or distribution is done by the intermediate processors. A NiFi Flow is built by connecting various processors via **connection/relationship**, the data enters the processors and is routed to one of the many connections defined by the processor.

So, a NiFi Processor is nothing but an atomic unit which performs some action on the data presented to it, contained in a FlowFile. At present there are more than 270 processors that come bundled with Apache NiFi. In addition to this, NiFi framework is built in such a way that it present the opportunity to extend the functionality by creating **Custom Processors**.

# Overview
To demonstrate building of new processor, we are going to create a processor which is capable of sorting a list of provided numbers according to the selected sorting method. Also, we are going to have a *dynamic property* to provide the output order (increasing/decreasing) and two relationship namely "Sorted" and "Failure".

This post is written to share my knowledge about custom NiFi Processors and how to build one from scratch. This post is divided into four (4) major sections. Each of which is listed below.

1. **Bootstrapping & project structure**
2. **Explanation of *Relationships* and *Properties***
3. **Explanation of overridden methods**
4. **Including new processor in NiFi and Testing it.**

### Bootstrapping & project structure

Apache NiFi uses maven as build automation tool and dependency manager. We are going to use [maven](https://maven.apache.org/what-is-maven.html). If you have some background of maven, you will be able to understand the project structure better. I assume you either have knowledge or you can learn about it on the go.
1. We use `mvn archetype:generate` to bootstrap a simple project and use that as a template.


#### Using maven archetype generator
To use `mvn archetype:generate` you must have maven install. You can download and install maven from [offical website](https://maven.apache.org/download.cgi). After you have successfully installed maven, you need to open terminal/command prompt and type 
```
mvn -v
```
you should see the version of installed maven binary.

1. To create a java project run:
```bash
mvn archetype:generate
```
This will list all the available archetypes from a remote repository and you will be presented with a list of all these archetypes.
![output1](/blog/output1.png)

2. type "nifi" and it will list the archetypes with keyword "nifi" in them
![output2](/blog/output2.png)
3. Select `org.apache.nifi:nifi-processor-bundle-archetype` by typing the corresponding number.
4. After selecting the archetype, it will list available versions. We are going to choose the latest version which matches the NiFi version also.
![output3](/blog/output3.png)
5. After you see `BUILD SUCCESS` you will have a directory created locally named `nifi-sorter-bundle`.
![output4](/blog/output4.png)
6. You will see a directory structure as below:
![output5](/blog/output5.png)

### Explanation of Relationships and Properties

Open your project in IntelliJ IDEA/Eclipse. Go to `nifi-sorter-bundle/nifi-sorter-processors/src/main/java/io/github/dkrypt/processors/sorter/MyProcessor.java`. Here you can see a `MyProcessor` class extending the `AbstractProcessor` class. 
1. Rename the file and class from `MyProcessor.java` to `Sorter.java`.

Here you can see **PropertyDescriptor** and **Relationship**. Let's discuss more about these two Java objects.

#### PropertyDescriptor

In a NiFi processor there are properties defined according to needs. A **[PropertyDescriptor](https://nifi.apache.org/docs/nifi-docs/html/developer-guide.html#property_descriptor)** defines the property to be used by a Processor.

A sample property is defined as *MY_PROPERTY*. We are going to delete this and create a new property as below
```java
public static final PropertyDescriptor SORT_ALGO = new PropertyDescriptor
        .Builder().name("SORT_ALGO")
        .displayName("Sorting Algorithm")
        .description("Algorithm to be used for sorting")
        .allowableValues("Selection Sort", "Bubble Sort", "Insertion Sort","Quick Sort", "Merge Sort")
        .required(true)
        .defaultValue("Selection Sort")
        .addValidator(StandardValidators.NON_EMPTY_VALIDATOR)
        .build();
```

#### Relationships

In a NiFi processor there are relationships (connections) defined according to output scenarios. A **[Relationships](https://nifi.apache.org/docs/nifi-docs/html/developer-guide.html#relationship)** defines route to which a FlowFile may be transferred from a Processor.

A sample relationship is already defined as *MY_RELATIONSHIP*. We are going to delete this and create two new relationships as below
```java
public static final Relationship REL_SORTED = new Relationship.Builder()
        .name("Sorted")
        .description("Relationship to route sorted flowfiles to.")
        .build();

public static final Relationship REL_FAILURE = new Relationship.Builder()
        .name("Failure")
        .description("Relationship to route failed flowfiles to.")
        .build();
```

### Explanation of overridden methods

As our main class extends the `AbstractProcessor` class. There are some methods which needs be overridden and defined.

* The first method that we are going to look and configure is the `init` method. This method takes `ProcessorInitializationContext` as argument. This methods initializes the properties and relationships. We are going to add our property ***SORT_ALGO*** and relationships ***REL_SORTED*** and ***REL_FAILURE***.

```java
final List<PropertyDescriptor> descriptors = new ArrayList<PropertyDescriptor>();
descriptors.add(SORT_ALGO);
this.descriptors = Collections.unmodifiableList(descriptors);

final Set<Relationship> relationships = new HashSet<Relationship>();
relationships.add(REL_SORTED);
relationships.add(REL_FAILURE);
this.relationships = Collections.unmodifiableSet(relationships);
```
* Next overridden method is `getRelationships`. This returns a `Set<Relationship>` with the initial values defined in `init` method.
* Similar to `getRelationships` we have another orverridden method `getSupportedPropertyDescriptors`. This returns a `List<PropertyDescriptor>` with values initialized in `init` method.
* Next method with `@OnScheduled` annotations is `onScheduled`. This is an important method which is invoked when the processor is scheduled to run. Here we do preprocessing on the property values.
To demonstrate the usage of this method we are going to take the property value and assign it to a variable `sortingAlgorithm`. Also we are going to fetch our dynamic property which is going to define the order of sorting. This is demonstrated below.

```java
private String sortingAlgorithm = null;
private String sortingOrder =  null;
@OnScheduled
public void onScheduled(final ProcessContext context) {
    sortingAlgorithm = context.getProperty(SORT_ALGO).getValue();
    context.getProperties().forEach((propertyDescriptor, s) -> {
        if(propertyDescriptor.isDynamic())
            sortingOrder = s;
    });
}
```
* Next, in our list of overridden methods is the `onTrigger` method. This method is triggerred when Processor is triggerred, either by incoming flowfile or according to the scheduled time. Here we get access to two arguments namely `ProcessContext` and `ProcessSession`. `ProcessSession`provides access to incoming flowfile. `FlowFile` can be used to get the data and attributes of the flowfile.

### Implementing sorting algorithms

Here we are going to define our *Sorting Algorithms*. We are going to create an interface named `Sorter` along with separate classes for each sorting algorithm. E.g. `SelectionSort.java` implementing interface `Sorter`. The project structure looks like below.
![output6](/blog/output6.png)

##### Our `onTrigger` method looks like below. Please refer to [this repository](https://github.com/dkrypt/nifi-sorter-bundle) here to look at the complete file with other methods.

```java
@Override
    public void onTrigger(final ProcessContext context, final ProcessSession session) throws ProcessException {
        // Get the incoming flowfile
        FlowFile flowFile = session.get();
        if ( flowFile == null ) return;
        boolean errorOccurred = false;
        // Read the contents of flowfile as String
        AtomicReference<String> inputString = new AtomicReference<>();
        session.read(flowFile, (in) -> {
            StringWriter writer = new StringWriter();
            IOUtils.copy(in, writer, Charset.defaultCharset());
            String input = writer.toString();
            inputString.set(input);
        });
        // Separate Strings by "\n" and Parse to Integer
        String[] inputStringList = inputString.get().split("\n");
        List<Integer> inputList = new ArrayList<>();
        for(String number : inputStringList)
            inputList.add(Integer.parseInt(number));

        // Sorting Logic
        AtomicReference<List<Integer>> finalSortedList = new AtomicReference<>();
        try {
            finalSortedList.set(sort(inputList));
        } catch (Exception e) {
            errorOccurred = true;
        }
        flowFile = session.write(flowFile, outputStream -> {
            String out = "";
            for (int sorted : finalSortedList.get()) {
                out = out.concat(Integer.toString(sorted)+"\n");
            }
            outputStream.write(out.getBytes());
        });
        if (errorOccurred) {
        session.transfer(flowFile, REL_FAILURE);
        }
        flowFile = session.putAttribute(flowFile, "execution time", Long.toString(executionTime.multipliedBy(1000).toMillis()));
        session.transfer(flowFile, REL_SORTED);
    }
```

### Including new processor in NiFi and Testing it.
Once you are done with coding your custom processor you have to build it and get a `.nar` file.
1. To build the project run `mvn clean install` from your parent directory. For me it is `nifi-sorter-bundle`.
2. Download NiFi binary from [here](https://archive.apache.org/dist/nifi/1.12.0/nifi-1.12.0-bin.zip). Unzip it and configure it to run.
3. After maven build go to `nifi-sorter-nar` directory. You will find a `target` directory created. Inside the target directory there will be a file named `nifi-sorter-nar-1.0.0.nar`. Copy this file to your NiFi binary directory as specified below.
4. Go to `/lib` directory inside your NiFi binary directory and paste the `nifi-sorter-nar-1.0.0.nar` file.
5. Run your NiFi and search for your processor in your list of processors.
![output7](/blog/output7.png)
6. See your processor on your canvas working. Here is a snapshot of processor in a flow.
![output8](/blog/output8.png)

