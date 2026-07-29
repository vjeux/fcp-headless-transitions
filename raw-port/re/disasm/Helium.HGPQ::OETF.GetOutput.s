__ZN4HGPQ4OETF9GetOutputEP10HGRenderer:
00000000000fe890	pushq	%rbp
00000000000fe891	movq	%rsp, %rbp
00000000000fe894	pushq	%r15
00000000000fe896	pushq	%r14
00000000000fe898	pushq	%rbx
00000000000fe899	pushq	%rax
00000000000fe89a	movq	%rdi, %rbx
00000000000fe89d	movq	0x198(%rdi), %r15
00000000000fe8a4	xorl	%r14d, %r14d
00000000000fe8a7	movq	%rsi, %rdi
00000000000fe8aa	movq	%rbx, %rsi
00000000000fe8ad	xorl	%edx, %edx
00000000000fe8af	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fe8b4	movq	(%r15), %rcx
00000000000fe8b7	movq	%r15, %rdi
00000000000fe8ba	xorl	%esi, %esi
00000000000fe8bc	movq	%rax, %rdx
00000000000fe8bf	callq	*0x78(%rcx)
00000000000fe8c2	movq	0x198(%rbx), %r15
00000000000fe8c9	testq	%r15, %r15
00000000000fe8cc	je	0xfe989
00000000000fe8d2	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000fe8d9	leaq	__ZTI17HgcBT2100_PQ_OETF(%rip), %rdx ## typeinfo for HgcBT2100_PQ_OETF
00000000000fe8e0	movq	%r15, %rdi
00000000000fe8e3	xorl	%ecx, %ecx
00000000000fe8e5	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000fe8ea	testq	%rax, %rax
00000000000fe8ed	je	0xfe96e
00000000000fe8ef	movq	%rax, %r14
00000000000fe8f2	movq	(%rax), %rax
00000000000fe8f5	movss	0x2d2687(%rip), %xmm0
00000000000fe8fd	movss	0x2d2683(%rip), %xmm1
00000000000fe905	movss	0x2d267f(%rip), %xmm2
00000000000fe90d	movss	0x2d2657(%rip), %xmm3
00000000000fe915	movq	%r14, %rdi
00000000000fe918	xorl	%esi, %esi
00000000000fe91a	callq	*0x60(%rax)
00000000000fe91d	movq	(%r14), %rax
00000000000fe920	movss	0x2d2648(%rip), %xmm0
00000000000fe928	movss	0x2d2660(%rip), %xmm1
00000000000fe930	movss	0x2d2630(%rip), %xmm2
00000000000fe938	xorps	%xmm3, %xmm3
00000000000fe93b	movq	%r14, %rdi
00000000000fe93e	movl	$0x1, %esi
00000000000fe943	callq	*0x60(%rax)
00000000000fe946	movss	0x1a0(%rbx), %xmm1
00000000000fe94e	movss	0x1a4(%rbx), %xmm2
00000000000fe956	movq	(%r14), %rax
00000000000fe959	movss	0x2d25f7(%rip), %xmm0
00000000000fe961	xorps	%xmm3, %xmm3
00000000000fe964	movq	%r14, %rdi
00000000000fe967	movl	$0x2, %esi
00000000000fe96c	jmp	0xfe9d0
00000000000fe96e	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000fe975	leaq	__ZTI26HgcBT2100_PQ_OETF_qtApprox(%rip), %rdx ## typeinfo for HgcBT2100_PQ_OETF_qtApprox
00000000000fe97c	movq	%r15, %rdi
00000000000fe97f	xorl	%ecx, %ecx
00000000000fe981	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000fe986	movq	%rax, %r14
00000000000fe989	movq	(%r14), %rax
00000000000fe98c	movss	0x2d2600(%rip), %xmm0
00000000000fe994	movss	0x2d25cc(%rip), %xmm1
00000000000fe99c	xorps	%xmm2, %xmm2
00000000000fe99f	xorps	%xmm3, %xmm3
00000000000fe9a2	movq	%r14, %rdi
00000000000fe9a5	xorl	%esi, %esi
00000000000fe9a7	callq	*0x60(%rax)
00000000000fe9aa	movss	0x1a0(%rbx), %xmm1
00000000000fe9b2	movss	0x1a4(%rbx), %xmm2
00000000000fe9ba	movq	(%r14), %rax
00000000000fe9bd	movss	0x2d2593(%rip), %xmm0
00000000000fe9c5	xorps	%xmm3, %xmm3
00000000000fe9c8	movq	%r14, %rdi
00000000000fe9cb	movl	$0x1, %esi
00000000000fe9d0	callq	*0x60(%rax)
00000000000fe9d3	movq	0x198(%rbx), %rax
00000000000fe9da	addq	$0x8, %rsp
00000000000fe9de	popq	%rbx
00000000000fe9df	popq	%r14
00000000000fe9e1	popq	%r15
00000000000fe9e3	popq	%rbp
00000000000fe9e4	retq
00000000000fe9e5	nopw	%cs:(%rax,%rax)
