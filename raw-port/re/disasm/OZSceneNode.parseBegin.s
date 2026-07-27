__ZN11OZSceneNode10parseBeginER22PCSerializerReadStream:
00000000000918e0	pushq	%rbp
00000000000918e1	movq	%rsp, %rbp
00000000000918e4	pushq	%r14
00000000000918e6	pushq	%rbx
00000000000918e7	movq	%rsi, %r14
00000000000918ea	movq	%rdi, %rbx
00000000000918ed	leaq	__ZL20OZSceneNodeReadScope(%rip), %rsi ## OZSceneNodeReadScope
00000000000918f4	movq	%r14, %rdi
00000000000918f7	callq	0x6de79c                        ## symbol stub for: __ZN22PCSerializerReadStream9pushScopeEP7PCScope
00000000000918fc	testq	%rbx, %rbx
00000000000918ff	je	0x9192f
0000000000091901	leaq	__ZTI11OZSceneNode(%rip), %rsi  ## typeinfo for OZSceneNode
0000000000091908	leaq	__ZTI13OZFxGenerator(%rip), %rdx ## typeinfo for OZFxGenerator
000000000009190f	movq	%rbx, %rdi
0000000000091912	xorl	%ecx, %ecx
0000000000091914	callq	0x6dfd0e                        ## symbol stub for: ___dynamic_cast
0000000000091919	testq	%rax, %rax
000000000009191c	je	0x9192f
000000000009191e	addq	$0x4bb0, %rax                   ## imm = 0x4BB0
0000000000091924	movq	%rax, %rdi
0000000000091927	movq	%r14, %rsi
000000000009192a	callq	__ZN18OZFxPlugSharedBase21pushDynamicParamScopeER22PCSerializerReadStream ## OZFxPlugSharedBase::pushDynamicParamScope(PCSerializerReadStream&)
000000000009192f	leaq	0x30(%rbx), %rdi
0000000000091933	movq	%r14, %rsi
0000000000091936	callq	__ZN19OZChannelObjectRoot10parseBeginER22PCSerializerReadStream ## OZChannelObjectRoot::parseBegin(PCSerializerReadStream&)
000000000009193b	movq	0x418(%rbx), %rax
0000000000091942	movq	%rax, 0x420(%rbx)
0000000000091949	movb	$0x1, %al
000000000009194b	popq	%rbx
000000000009194c	popq	%r14
000000000009194e	popq	%rbp
000000000009194f	retq
