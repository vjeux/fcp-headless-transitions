__ZN4HGPQ4OOTF9GetOutputEP10HGRenderer:
00000000000fe310	pushq	%rbp
00000000000fe311	movq	%rsp, %rbp
00000000000fe314	pushq	%r15
00000000000fe316	pushq	%r14
00000000000fe318	pushq	%rbx
00000000000fe319	pushq	%rax
00000000000fe31a	movq	%rdi, %rbx
00000000000fe31d	movq	0x198(%rdi), %r14
00000000000fe324	movq	%rsi, %rdi
00000000000fe327	movq	%rbx, %rsi
00000000000fe32a	xorl	%edx, %edx
00000000000fe32c	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
00000000000fe331	movq	(%r14), %rcx
00000000000fe334	movq	%r14, %rdi
00000000000fe337	xorl	%esi, %esi
00000000000fe339	movq	%rax, %rdx
00000000000fe33c	callq	*0x78(%rcx)
00000000000fe33f	movq	0x198(%rbx), %r15
00000000000fe346	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000fe34d	leaq	__ZTI17HgcBT2100_PQ_OOTF(%rip), %rdx ## typeinfo for HgcBT2100_PQ_OOTF
00000000000fe354	movq	%r15, %rdi
00000000000fe357	xorl	%ecx, %ecx
00000000000fe359	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000fe35e	testq	%rax, %rax
00000000000fe361	je	0xfe3b7
00000000000fe363	movq	%rax, %r14
00000000000fe366	movss	0x1a0(%rbx), %xmm0
00000000000fe36e	movss	0x1a4(%rbx), %xmm1
00000000000fe376	movss	0x1a8(%rbx), %xmm2
00000000000fe37e	movq	(%rax), %rax
00000000000fe381	movss	0x2d2be3(%rip), %xmm3
00000000000fe389	movq	%r14, %rdi
00000000000fe38c	xorl	%esi, %esi
00000000000fe38e	callq	*0x60(%rax)
00000000000fe391	movq	(%r14), %rax
00000000000fe394	movss	0x2d2bd4(%rip), %xmm0
00000000000fe39c	movss	0x2cbed4(%rip), %xmm1
00000000000fe3a4	xorps	%xmm2, %xmm2
00000000000fe3a7	xorps	%xmm3, %xmm3
00000000000fe3aa	movq	%r14, %rdi
00000000000fe3ad	movl	$0x1, %esi
00000000000fe3b2	callq	*0x60(%rax)
00000000000fe3b5	jmp	0xfe3f5
00000000000fe3b7	leaq	__ZTI6HGNode(%rip), %rsi        ## typeinfo for HGNode
00000000000fe3be	leaq	__ZTI26HgcBT2100_PQ_OOTF_qtApprox(%rip), %rdx ## typeinfo for HgcBT2100_PQ_OOTF_qtApprox
00000000000fe3c5	movq	%r15, %rdi
00000000000fe3c8	xorl	%ecx, %ecx
00000000000fe3ca	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
00000000000fe3cf	movss	0x1ac(%rbx), %xmm2
00000000000fe3d7	movq	(%rax), %rcx
00000000000fe3da	movss	0x2c98de(%rip), %xmm0
00000000000fe3e2	movss	0x2d2b8a(%rip), %xmm1
00000000000fe3ea	xorps	%xmm3, %xmm3
00000000000fe3ed	movq	%rax, %rdi
00000000000fe3f0	xorl	%esi, %esi
00000000000fe3f2	callq	*0x60(%rcx)
00000000000fe3f5	movq	0x198(%rbx), %rax
00000000000fe3fc	addq	$0x8, %rsp
00000000000fe400	popq	%rbx
00000000000fe401	popq	%r14
00000000000fe403	popq	%r15
00000000000fe405	popq	%rbp
00000000000fe406	retq
00000000000fe407	nopw	(%rax,%rax)
