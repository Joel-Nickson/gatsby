test(`Infers graphql type from array of nodes`, () => {
  const { inferObjectStructureFromNodes } = require(`../infer-graphql-type`)
  const {
    graphql,
    GraphQLObjectType,
    GraphQLList,
    GraphQLSchema,
  } = require(`graphql`)
  const nodes = [
    {
      id: `foo`,
      name: `The Mad Max`,
      type: `Test`,
      hair: 1,
      date: `1012-11-01`,
      anArray: [1, 2, 3, 4],
      anObjectArray: [
        { aString: `some string`, aNumber: 2, aBoolean: true },
        { aString: `some string`, aNumber: 2, anArray: [1, 2] },
      ],
      deepObject: {
        level: 1,
        deepObject: {
          level: 2,
          deepObject: {
            level: 3,
          },
        },
      },
      aBoolean: true,
      externalUrl: `https://example.com/awesome.jpg`,
      domain: `pizza.com`,
      frontmatter: {
        date: `1012-11-01`,
        title: `The world of dash and adventure`,
        blue: 100,
      },
    },
    {
      id: `boo`,
      name: `The Mad Wax`,
      type: `Test`,
      hair: 2,
      date: `1984-10-12`,
      anArray: [1, 2, 5, 4],
      frontmatter: {
        date: `1984-10-12`,
        title: `The world of slash and adventure`,
        blue: 10010,
      },
    },
  ]
  const inferredFields = inferObjectStructureFromNodes({
    nodes,
    types: [{ name: `Test` }],
  })
  const nodeType = new GraphQLObjectType({
    name: `TEST`,
    fields: { ...inferredFields },
  })
  const listNode = {
    name: `LISTNODE`,
    type: new GraphQLList(nodeType),
    resolve() {
      return nodes
    },
  }
  const schema = new GraphQLSchema({
    query: new GraphQLObjectType({
      name: `RootQueryType`,
      fields: () => ({
        listNode,
      }),
    }),
  })
  graphql(
    schema,
    `
        {
          listNode {
            hair,
            anArray,
            anObjectArray {
              aString,
              aNumber,
              aBoolean,
              anArray
            },
            deepObject {
              level
              deepObject {
                level
                deepObject {
                  level
                }
              }
            }
            aBoolean,
            externalUrl,
            domain,
            date(formatString: "YYYY"),
            frontmatter {
              title,
              date(formatString: "YYYY")
            }
          }
        }
        `
  ).then(result =>
    expect(result).toEqual({
      data: {
        listNode: [
          {
            hair: 1,
            anArray: [1, 2, 3, 4],
            anObjectArray: [
              {
                aString: `some string`,
                aNumber: 2,
                aBoolean: true,
                anArray: null,
              },
              {
                aString: `some string`,
                aNumber: 2,
                aBoolean: null,
                anArray: [1, 2],
              },
            ],
            deepObject: {
              level: 1,
              deepObject: {
                level: 2,
                deepObject: {
                  level: 3,
                },
              },
            },
            aBoolean: true,
            externalUrl: `https://example.com/awesome.jpg`,
            domain: `pizza.com`,
            date: `1012`,
            frontmatter: {
              date: `1012`,
              title: `The world of dash and adventure`,
            },
          },
          {
            hair: 2,
            anArray: [1, 2, 5, 4],
            anObjectArray: null,
            deepObject: null,
            aBoolean: null,
            externalUrl: null,
            domain: null,
            date: `1984`,
            frontmatter: {
              date: `1984`,
              title: `The world of slash and adventure`,
            },
          },
        ],
      },
    })
  )
})
