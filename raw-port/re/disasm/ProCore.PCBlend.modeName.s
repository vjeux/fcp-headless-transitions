__ZN7PCBlend8modeNameE11PCBlendModeb:
0000000000017bb6	pushq	%rbp
0000000000017bb7	movq	%rsp, %rbp
0000000000017bba	pushq	%r14
0000000000017bbc	pushq	%rbx
0000000000017bbd	movl	%esi, %r14d
0000000000017bc0	movl	%edi, %ebx
0000000000017bc2	callq	__ZN7PCBlendL17getModeNameVectorEv ## PCBlend::getModeNameVector()
0000000000017bc7	movq	__ZZN7PCBlendL17getModeNameVectorEvE14modeNameVector(%rip), %rax ## PCBlend::getModeNameVector()::modeNameVector
0000000000017bce	cmpq	%rax, 0x143723(%rip)
0000000000017bd5	jne	0x17be3
0000000000017bd7	callq	__ZN7PCBlendL24initializeModeNameVectorEv ## PCBlend::initializeModeNameVector()
0000000000017bdc	movq	__ZZN7PCBlendL17getModeNameVectorEvE14modeNameVector(%rip), %rax ## PCBlend::getModeNameVector()::modeNameVector
0000000000017be3	xorb	$0x1, %r14b
0000000000017be7	movzbl	%r14b, %ecx
0000000000017beb	leal	(%rbx,%rcx,2), %ecx
0000000000017bee	movslq	%ecx, %rcx
0000000000017bf1	leaq	(%rax,%rcx,8), %rax
0000000000017bf5	popq	%rbx
0000000000017bf6	popq	%r14
0000000000017bf8	popq	%rbp
0000000000017bf9	retq
