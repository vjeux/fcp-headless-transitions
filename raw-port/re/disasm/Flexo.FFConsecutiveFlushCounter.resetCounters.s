__ZN25FFConsecutiveFlushCounter13resetCountersEb:
0000000000d58d50	pushq	%rbp
0000000000d58d51	movq	%rsp, %rbp
0000000000d58d54	xorps	%xmm0, %xmm0
0000000000d58d57	movups	%xmm0, (%rdi)
0000000000d58d5a	movq	$0x0, 0x10(%rdi)
0000000000d58d62	testl	%esi, %esi
0000000000d58d64	je	0xd58d6e
0000000000d58d66	movq	$0x0, 0x18(%rdi)
0000000000d58d6e	popq	%rbp
0000000000d58d6f	retq
