import { Temporal } from "@js-temporal/polyfill"
import delay from "delay"
import { fixturedTest } from "test/fixtured-test.js"

fixturedTest(
  "can deduplicate recent messages",
  async ({ onTestFinished, azure_queue, expect }) => {
    const { sb_client, createQueue } = azure_queue

    const queue = await createQueue("queue", {
      requiresDuplicateDetection: true,
    })

    const sender = sb_client.createSender(queue.name!)
    onTestFinished(() => sender.close())

    await sender.sendMessages({
      body: "hello world!",
      messageId: "1234",
    })

    await sender.sendMessages({
      body: "hello world!",
      messageId: "1234",
    })

    const receiver = sb_client.createReceiver(queue.name!, {})
    onTestFinished(() => receiver.close())

    {
      const messages = await receiver.receiveMessages(2, {
        maxWaitTimeInMs: 0,
      })

      expect(messages).toHaveLength(1)
    }
  },
)

fixturedTest(
  "duplicate detection does not occur for messages outside of history window period",
  async ({ onTestFinished, azure_queue, expect }) => {
    const { sb_client, createQueue } = azure_queue

    const queue = await createQueue("queue", {
      requiresDuplicateDetection: true,
      duplicateDetectionHistoryTimeWindow: Temporal.Duration.from({
        milliseconds: 1,
      }).toString(),
    })

    const sender = sb_client.createSender(queue.name!)
    onTestFinished(() => sender.close())

    await sender.sendMessages({
      body: "hello world!",
      messageId: "1234",
    })

    await delay(10)

    await sender.sendMessages({
      body: "hello world!",
      messageId: "1234",
    })

    const receiver = sb_client.createReceiver(queue.name!, {})
    onTestFinished(() => receiver.close())

    {
      const messages = await receiver.receiveMessages(2, {
        maxWaitTimeInMs: 0,
      })

      expect(messages).toHaveLength(2)
    }
  },
)