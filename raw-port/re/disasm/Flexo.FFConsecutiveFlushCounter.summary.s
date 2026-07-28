__ZN25FFConsecutiveFlushCounter7summaryEv:
0000000000d58de0	pushq	%rbp
0000000000d58de1	movq	%rsp, %rbp
0000000000d58de4	pushq	%rbx
0000000000d58de5	pushq	%rax
0000000000d58de6	movq	0xb9477b(%rip), %rax            ## literal pool symbol address: _OBJC_CLASS_$_NSString
0000000000d58ded	movl	0x8(%rdi), %r8d
0000000000d58df1	movl	0x10(%rdi), %r9d
0000000000d58df5	movl	(%rdi), %ecx
0000000000d58df7	movl	0x4(%rdi), %r10d
0000000000d58dfb	movl	0xc(%rdi), %r11d
0000000000d58dff	movl	0x14(%rdi), %ebx
0000000000d58e02	movq	0xe5f70f(%rip), %rsi
0000000000d58e09	subq	$0x8, %rsp
0000000000d58e0d	leaq	0xc534b4(%rip), %rdx            ## Objc cfstring ref: @"bad cfstring ref"
0000000000d58e14	movq	%rax, %rdi
0000000000d58e17	xorl	%eax, %eax
0000000000d58e19	pushq	%rbx
0000000000d58e1a	pushq	%r11
0000000000d58e1c	pushq	%r10
0000000000d58e1e	callq	*0xb9489c(%rip)                 ## Objc message: -[%rdi requestedSizeForAssetSize:scaleDownFactor:codec:outProxySizeAdjustedForCodec:]
0000000000d58e24	addq	$0x28, %rsp
0000000000d58e28	popq	%rbx
0000000000d58e29	popq	%rbp
0000000000d58e2a	retq
0000000000d58e2b	nopl	(%rax,%rax)
