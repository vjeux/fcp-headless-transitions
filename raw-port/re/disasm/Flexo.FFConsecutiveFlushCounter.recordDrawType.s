__ZN25FFConsecutiveFlushCounter14recordDrawTypeEbb:
0000000000d58db0	pushq	%rbp
0000000000d58db1	movq	%rsp, %rbp
0000000000d58db4	movq	$0x0, (%rdi)
0000000000d58dbb	testl	%esi, %esi
0000000000d58dbd	je	0xd58dc5
0000000000d58dbf	testb	%dl, %dl
0000000000d58dc1	je	0xd58dd1
0000000000d58dc3	popq	%rbp
0000000000d58dc4	retq
0000000000d58dc5	movq	$0x0, 0x8(%rdi)
0000000000d58dcd	testb	%dl, %dl
0000000000d58dcf	jne	0xd58dc3
0000000000d58dd1	movq	$0x0, 0x10(%rdi)
0000000000d58dd9	popq	%rbp
0000000000d58dda	retq
0000000000d58ddb	nopl	(%rax,%rax)
