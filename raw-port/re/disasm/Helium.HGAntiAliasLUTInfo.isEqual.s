__ZNK18HGAntiAliasLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000211ac0	pushq	%rbp
0000000000211ac1	movq	%rsp, %rbp
0000000000211ac4	pushq	%r14
0000000000211ac6	pushq	%rbx
0000000000211ac7	testq	%rsi, %rsi
0000000000211aca	je	0x211afd
0000000000211acc	movq	%rdi, %r14
0000000000211acf	movq	0x7f080a(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000211ad6	leaq	__ZTI18HGAntiAliasLUTInfo(%rip), %rdx ## typeinfo for HGAntiAliasLUTInfo
0000000000211add	xorl	%ebx, %ebx
0000000000211adf	movq	%rsi, %rdi
0000000000211ae2	movq	%rax, %rsi
0000000000211ae5	xorl	%ecx, %ecx
0000000000211ae7	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000211aec	testq	%rax, %rax
0000000000211aef	je	0x211aff
0000000000211af1	movl	0x8(%r14), %ecx
0000000000211af5	cmpl	0x8(%rax), %ecx
0000000000211af8	sete	%bl
0000000000211afb	jmp	0x211aff
0000000000211afd	xorl	%ebx, %ebx
0000000000211aff	movl	%ebx, %eax
0000000000211b01	popq	%rbx
0000000000211b02	popq	%r14
0000000000211b04	popq	%rbp
0000000000211b05	retq
0000000000211b06	nopw	%cs:(%rax,%rax)
