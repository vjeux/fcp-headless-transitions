__ZN16XMLtoFactoryBase10parseBeginER22PCSerializerReadStream:
000000000033d160	pushq	%rbp
000000000033d161	movq	%rsp, %rbp
000000000033d164	pushq	%r14
000000000033d166	pushq	%rbx
000000000033d167	movq	%rsi, %rbx
000000000033d16a	leaq	_theApp(%rip), %r14
000000000033d171	movq	(%r14), %rax
000000000033d174	movq	0x20(%rax), %rdi
000000000033d178	callq	0x6dd5d2                        ## symbol stub for: __ZN11OZFactories19clearFactoryLoadIDsEv
000000000033d17d	movq	(%r14), %rax
000000000033d180	movq	0x28(%rax), %rcx
000000000033d184	movq	%rcx, 0x30(%rax)
000000000033d188	leaq	_OZXMLRootScope(%rip), %rsi
000000000033d18f	movq	%rbx, %rdi
000000000033d192	callq	0x6de79c                        ## symbol stub for: __ZN22PCSerializerReadStream9pushScopeEP7PCScope
000000000033d197	movb	$0x1, %al
000000000033d199	popq	%rbx
000000000033d19a	popq	%r14
000000000033d19c	popq	%rbp
000000000033d19d	retq
000000000033d19e	nop
