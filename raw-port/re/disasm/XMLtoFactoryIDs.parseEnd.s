__ZN15XMLtoFactoryIDs8parseEndER22PCSerializerReadStream:
000000000033cee0	pushq	%rbp
000000000033cee1	movq	%rsp, %rbp
000000000033cee4	pushq	%rbx
000000000033cee5	pushq	%rax
000000000033cee6	leaq	_theApp(%rip), %rbx
000000000033ceed	movq	(%rbx), %rax
000000000033cef0	movq	0x20(%rax), %rdi
000000000033cef4	callq	0x6dd5d2                        ## symbol stub for: __ZN11OZFactories19clearFactoryLoadIDsEv
000000000033cef9	movq	(%rbx), %rax
000000000033cefc	movq	0x28(%rax), %rcx
000000000033cf00	movq	%rcx, 0x30(%rax)
000000000033cf04	movb	$0x1, %al
000000000033cf06	addq	$0x8, %rsp
000000000033cf0a	popq	%rbx
000000000033cf0b	popq	%rbp
000000000033cf0c	retq
000000000033cf0d	nopl	(%rax)
