__ZN14OZImageElement10parseBeginER22PCSerializerReadStream:
00000000005f85c0	pushq	%rbp
00000000005f85c1	movq	%rsp, %rbp
00000000005f85c4	pushq	%rbx
00000000005f85c5	pushq	%rax
00000000005f85c6	movq	%rsi, %rbx
00000000005f85c9	movb	$0x1, 0x7461(%rdi)
00000000005f85d0	movl	$0x0, 0x7d48(%rdi)
00000000005f85da	callq	__ZN9OZElement10parseBeginER22PCSerializerReadStream ## OZElement::parseBegin(PCSerializerReadStream&)
00000000005f85df	leaq	__ZL19OZImageElementScope(%rip), %rsi ## OZImageElementScope
00000000005f85e6	movq	%rbx, %rdi
00000000005f85e9	callq	0x6de79c                        ## symbol stub for: __ZN22PCSerializerReadStream9pushScopeEP7PCScope
00000000005f85ee	movb	$0x1, %al
00000000005f85f0	addq	$0x8, %rsp
00000000005f85f4	popq	%rbx
00000000005f85f5	popq	%rbp
00000000005f85f6	retq
00000000005f85f7	nopw	(%rax,%rax)
