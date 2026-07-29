__ZN16HGLinearFilter2D7setTypeE14HGFilterPresetj:
000000000010acd0	cmpl	$0x39, %esi
000000000010acd3	ja	0x10ad88
000000000010acd9	pushq	%rbp
000000000010acda	movq	%rsp, %rbp
000000000010acdd	pushq	%r15
000000000010acdf	pushq	%r14
000000000010ace1	pushq	%r13
000000000010ace3	pushq	%r12
000000000010ace5	pushq	%rbx
000000000010ace6	subq	$0x28, %rsp
000000000010acea	movl	%esi, %r9d
000000000010aced	leaq	0x9107d4(%rip), %rax
000000000010acf4	movq	(%rax,%r9,8), %r15
000000000010acf8	leaq	0x2c99c9(%rip), %rax
000000000010acff	movl	(%rax,%r9,4), %r12d
000000000010ad03	leaq	0x2c9aa6(%rip), %rax
000000000010ad0a	movl	(%rax,%r9,4), %r13d
000000000010ad0e	leal	-0x1(%r13), %ecx
000000000010ad12	movl	%ecx, %ebx
000000000010ad14	shrl	%ebx
000000000010ad16	leal	-0x1(%r12), %r8d
000000000010ad1b	movl	%r8d, %r11d
000000000010ad1e	shrl	%r11d
000000000010ad21	cmpl	$0x4, %edx
000000000010ad24	jne	0x10ad8f
000000000010ad26	movl	0x1c(%rdi), %ecx
000000000010ad29	testb	$0x2, %cl
000000000010ad2c	je	0x10ad5d
000000000010ad2e	movq	(%rdi), %rax
000000000010ad31	testq	%rax, %rax
000000000010ad34	je	0x10ad5d
000000000010ad36	movq	%rdi, -0x30(%rbp)
000000000010ad3a	movq	%rax, %rdi
000000000010ad3d	movl	%esi, %r14d
000000000010ad40	movq	%r12, -0x38(%rbp)
000000000010ad44	movl	%r11d, %r12d
000000000010ad47	callq	0x3c4f9a                        ## symbol stub for: __ZdaPv
000000000010ad4c	movl	%r12d, %r11d
000000000010ad4f	movq	-0x38(%rbp), %r12
000000000010ad53	movq	-0x30(%rbp), %rdi
000000000010ad57	movl	%r14d, %esi
000000000010ad5a	movl	0x1c(%rdi), %ecx
000000000010ad5d	movl	%r13d, 0x10(%rdi)
000000000010ad61	movl	%r12d, 0x14(%rdi)
000000000010ad65	movq	%r15, (%rdi)
000000000010ad68	andl	$-0x3, %ecx
000000000010ad6b	movl	%ecx, 0x1c(%rdi)
000000000010ad6e	negl	%ebx
000000000010ad70	movl	%ebx, 0x8(%rdi)
000000000010ad73	negl	%r11d
000000000010ad76	movl	%r11d, 0xc(%rdi)
000000000010ad7a	addq	$0x28, %rsp
000000000010ad7e	popq	%rbx
000000000010ad7f	popq	%r12
000000000010ad81	popq	%r13
000000000010ad83	popq	%r14
000000000010ad85	popq	%r15
000000000010ad87	popq	%rbp
000000000010ad88	cmpl	$0x3a, %esi
000000000010ad8b	setb	%al
000000000010ad8e	retq
000000000010ad8f	movl	0x8(%rdi), %eax
000000000010ad92	movq	%r9, -0x48(%rbp)
000000000010ad96	movl	0xc(%rdi), %r9d
000000000010ad9a	cmpl	%eax, %ebx
000000000010ad9c	movl	0x10(%rdi), %r10d
000000000010ada0	leal	-0x1(%rax,%r10), %r10d
000000000010ada5	cmovll	%ebx, %eax
000000000010ada8	movl	%ebx, -0x3c(%rbp)
000000000010adab	cmpl	%r9d, %r11d
000000000010adae	movq	%r12, -0x38(%rbp)
000000000010adb2	movl	%r11d, %r12d
000000000010adb5	movl	0x14(%rdi), %r11d
000000000010adb9	leal	-0x1(%r9,%r11), %r11d
000000000010adbe	cmovll	%r12d, %r9d
000000000010adc2	addl	%ebx, %ecx
000000000010adc4	cmpl	%r10d, %ecx
000000000010adc7	cmovlel	%r10d, %ecx
000000000010adcb	addl	%r12d, %r8d
000000000010adce	cmpl	%r11d, %r8d
000000000010add1	cmovlel	%r11d, %r8d
000000000010add5	xorl	%ebx, %ebx
000000000010add7	movq	%rdi, %r14
000000000010adda	movl	%esi, -0x30(%rbp)
000000000010addd	movl	%eax, %esi
000000000010addf	movl	%edx, -0x40(%rbp)
000000000010ade2	movl	%r9d, %edx
000000000010ade5	xorl	%r9d, %r9d
000000000010ade8	callq	__ZN16HGLinearFilter2D6resizeEiiiii ## HGLinearFilter2D::resize(int, int, int, int, int)
000000000010aded	movl	-0x30(%rbp), %esi
000000000010adf0	movl	-0x3c(%rbp), %eax
000000000010adf3	subl	0x8(%r14), %eax
000000000010adf7	subl	0xc(%r14), %r12d
000000000010adfb	imull	0x10(%r14), %r12d
000000000010ae00	addl	%eax, %r12d
000000000010ae03	movslq	%r12d, %rax
000000000010ae06	movq	-0x38(%rbp), %r11
000000000010ae0a	shlq	$0x4, %rax
000000000010ae0e	addq	(%r14), %rax
000000000010ae11	movl	-0x40(%rbp), %ecx
000000000010ae14	shlq	$0x4, %rcx
000000000010ae18	leaq	__ZL6g_Mask(%rip), %rdx         ## g_Mask
000000000010ae1f	movaps	(%rcx,%rdx), %xmm0
000000000010ae23	movl	$0x1, %edx
000000000010ae28	movq	-0x48(%rbp), %rcx
000000000010ae2c	shlq	%cl, %rdx
000000000010ae2f	movl	%r13d, %ecx
000000000010ae32	andl	$0x7ffffffe, %ecx               ## imm = 0x7FFFFFFE
000000000010ae38	movq	%r13, %rdi
000000000010ae3b	shlq	$0x4, %rdi
000000000010ae3f	movabsq	$0x4054aa55200001, %r8          ## imm = 0x4054AA55200001
000000000010ae49	jmp	0x10ae69
000000000010ae4b	nopl	(%rax,%rax)
000000000010ae50	movslq	0x10(%r14), %r9
000000000010ae54	shlq	$0x4, %r9
000000000010ae58	addq	%r9, %rax
000000000010ae5b	addq	%rdi, %r15
000000000010ae5e	incl	%ebx
000000000010ae60	cmpl	%r11d, %ebx
000000000010ae63	je	0x10ad7a
000000000010ae69	testq	%r8, %rdx
000000000010ae6c	je	0x10ae80
000000000010ae6e	xorl	%r9d, %r9d
000000000010ae71	jmp	0x10aec2
000000000010ae73	nopw	%cs:(%rax,%rax)
000000000010ae80	movl	$0x10, %r10d
000000000010ae86	xorl	%r9d, %r9d
000000000010ae89	nopl	(%rax)
000000000010ae90	movaps	-0x10(%rax,%r10), %xmm1
000000000010ae96	movaps	(%rax,%r10), %xmm2
000000000010ae9b	blendvps	%xmm0, -0x10(%r15,%r10), %xmm1
000000000010aea3	movaps	%xmm1, -0x10(%rax,%r10)
000000000010aea9	blendvps	%xmm0, (%r15,%r10), %xmm2
000000000010aeb0	movaps	%xmm2, (%rax,%r10)
000000000010aeb5	addq	$0x2, %r9
000000000010aeb9	addq	$0x20, %r10
000000000010aebd	cmpq	%r9, %rcx
000000000010aec0	jne	0x10ae90
000000000010aec2	testb	$0x1, %r13b
000000000010aec6	je	0x10ae50
000000000010aec8	shlq	$0x4, %r9
000000000010aecc	movaps	(%rax,%r9), %xmm1
000000000010aed1	blendvps	%xmm0, (%r15,%r9), %xmm1
000000000010aed8	movaps	%xmm1, (%rax,%r9)
000000000010aedd	jmp	0x10ae50
000000000010aee2	nopw	%cs:(%rax,%rax)
