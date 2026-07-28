__ZNK15HGDitherLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
000000000006ff20	pushq	%rbp
000000000006ff21	movq	%rsp, %rbp
000000000006ff24	pushq	%r14
000000000006ff26	pushq	%rbx
000000000006ff27	testq	%rsi, %rsi
000000000006ff2a	je	0x6ff5d
000000000006ff2c	movq	%rdi, %r14
000000000006ff2f	movq	0x9923aa(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
000000000006ff36	leaq	__ZTI15HGDitherLUTInfo(%rip), %rdx ## typeinfo for HGDitherLUTInfo
000000000006ff3d	xorl	%ebx, %ebx
000000000006ff3f	movq	%rsi, %rdi
000000000006ff42	movq	%rax, %rsi
000000000006ff45	xorl	%ecx, %ecx
000000000006ff47	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
000000000006ff4c	testq	%rax, %rax
000000000006ff4f	je	0x6ff5f
000000000006ff51	movl	0x8(%r14), %ecx
000000000006ff55	cmpl	0x8(%rax), %ecx
000000000006ff58	sete	%bl
000000000006ff5b	jmp	0x6ff5f
000000000006ff5d	xorl	%ebx, %ebx
000000000006ff5f	movl	%ebx, %eax
000000000006ff61	popq	%rbx
000000000006ff62	popq	%r14
000000000006ff64	popq	%rbp
000000000006ff65	retq
000000000006ff66	nopw	%cs:(%rax,%rax)
