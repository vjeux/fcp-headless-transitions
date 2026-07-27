__ZN15OZTransformNode10parseBeginER22PCSerializerReadStream:
00000000001ce810	pushq	%rbp
00000000001ce811	movq	%rsp, %rbp
00000000001ce814	pushq	%rbx
00000000001ce815	pushq	%rax
00000000001ce816	movq	%rsi, %rbx
00000000001ce819	movl	$0x0, 0x18d8(%rdi)
00000000001ce823	callq	__ZN11OZSceneNode10parseBeginER22PCSerializerReadStream ## OZSceneNode::parseBegin(PCSerializerReadStream&)
00000000001ce828	leaq	__ZL20OZTransformNodeScope(%rip), %rsi ## OZTransformNodeScope
00000000001ce82f	movq	%rbx, %rdi
00000000001ce832	callq	0x6de79c                        ## symbol stub for: __ZN22PCSerializerReadStream9pushScopeEP7PCScope
00000000001ce837	movb	$0x1, %al
00000000001ce839	addq	$0x8, %rsp
00000000001ce83d	popq	%rbx
00000000001ce83e	popq	%rbp
00000000001ce83f	retq
