__ZN16XMLtoFactoryBase8parseEndER22PCSerializerReadStream:
000000000033d1a0	pushq	%rbp
000000000033d1a1	movq	%rsp, %rbp
000000000033d1a4	pushq	%rbx
000000000033d1a5	pushq	%rax
000000000033d1a6	leaq	_theApp(%rip), %rbx
000000000033d1ad	movq	(%rbx), %rax
000000000033d1b0	movq	0x20(%rax), %rdi
000000000033d1b4	callq	0x6dd5d2                        ## symbol stub for: __ZN11OZFactories19clearFactoryLoadIDsEv
000000000033d1b9	movq	(%rbx), %rax
000000000033d1bc	movq	0x28(%rax), %rcx
000000000033d1c0	movq	%rcx, 0x30(%rax)
000000000033d1c4	movb	$0x1, %al
000000000033d1c6	addq	$0x8, %rsp
000000000033d1ca	popq	%rbx
000000000033d1cb	popq	%rbp
000000000033d1cc	retq
000000000033d1cd	nopl	(%rax)
