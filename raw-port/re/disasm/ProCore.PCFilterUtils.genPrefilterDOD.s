__ZN13PCFilterUtils15genPrefilterDODE5PCPtrI8PCFilterERK6PCRectIiE:
000000000008c2e6	pushq	%rbp
000000000008c2e7	movq	%rsp, %rbp
000000000008c2ea	pushq	%r15
000000000008c2ec	pushq	%r14
000000000008c2ee	pushq	%rbx
000000000008c2ef	pushq	%rax
000000000008c2f0	movq	%rdx, %r14
000000000008c2f3	movq	%rdi, %rbx
000000000008c2f6	movq	(%rsi), %rdi
000000000008c2f9	testq	%rdi, %rdi
000000000008c2fc	jne	0x8c30e
000000000008c2fe	movq	%rsi, %r15
000000000008c301	movl	$0x1, %edi
000000000008c306	callq	__Z28throw_PCNullPointerExceptionb ## throw_PCNullPointerException(bool)
000000000008c30b	movq	(%r15), %rdi
000000000008c30e	callq	__ZNK8PCFilter4sizeEv           ## PCFilter::size() const
000000000008c313	movl	%eax, %ecx
000000000008c315	decl	%ecx
000000000008c317	shrl	$0x1f, %ecx
000000000008c31a	addl	%ecx, %eax
000000000008c31c	decl	%eax
000000000008c31e	movd	%eax, %xmm0
000000000008c322	andl	$-0x2, %eax
000000000008c325	psrad	$0x1, %xmm0
000000000008c32a	pinsrd	$0x1, %eax, %xmm0
000000000008c330	movdqu	(%r14), %xmm1
000000000008c335	pshufd	$0x50, %xmm0, %xmm0             ## xmm0 = xmm0[0,0,1,1]
000000000008c33a	movdqa	%xmm1, %xmm2
000000000008c33e	psubd	%xmm0, %xmm2
000000000008c342	paddd	%xmm0, %xmm1
000000000008c346	pblendw	$0xf, %xmm2, %xmm1              ## xmm1 = xmm2[0,1,2,3],xmm1[4,5,6,7]
000000000008c34c	movdqu	%xmm1, (%rbx)
000000000008c350	movq	%rbx, %rax
000000000008c353	addq	$0x8, %rsp
000000000008c357	popq	%rbx
000000000008c358	popq	%r14
000000000008c35a	popq	%r15
000000000008c35c	popq	%rbp
000000000008c35d	retq
