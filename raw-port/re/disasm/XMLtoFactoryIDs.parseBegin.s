__ZN15XMLtoFactoryIDs10parseBeginER22PCSerializerReadStream:
000000000033cea0	pushq	%rbp
000000000033cea1	movq	%rsp, %rbp
000000000033cea4	pushq	%r14
000000000033cea6	pushq	%rbx
000000000033cea7	movq	%rsi, %rbx
000000000033ceaa	leaq	_theApp(%rip), %r14
000000000033ceb1	movq	(%r14), %rax
000000000033ceb4	movq	0x20(%rax), %rdi
000000000033ceb8	callq	0x6dd5d2                        ## symbol stub for: __ZN11OZFactories19clearFactoryLoadIDsEv
000000000033cebd	movq	(%r14), %rax
000000000033cec0	movq	0x28(%rax), %rcx
000000000033cec4	movq	%rcx, 0x30(%rax)
000000000033cec8	leaq	_OZXMLRootScope(%rip), %rsi
000000000033cecf	movq	%rbx, %rdi
000000000033ced2	callq	0x6de79c                        ## symbol stub for: __ZN22PCSerializerReadStream9pushScopeEP7PCScope
000000000033ced7	movb	$0x1, %al
000000000033ced9	popq	%rbx
000000000033ceda	popq	%r14
000000000033cedc	popq	%rbp
000000000033cedd	retq
000000000033cede	nop
