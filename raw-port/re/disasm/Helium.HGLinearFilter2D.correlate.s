__ZN16HGLinearFilter2D9correlateERKS_:
000000000010ec30	pushq	%rbp
000000000010ec31	movq	%rsp, %rbp
000000000010ec34	pushq	%r15
000000000010ec36	pushq	%r14
000000000010ec38	pushq	%r13
000000000010ec3a	pushq	%r12
000000000010ec3c	pushq	%rbx
000000000010ec3d	subq	$0x1b8, %rsp                    ## imm = 0x1B8
000000000010ec44	movq	%rdi, %rbx
000000000010ec47	cmpq	$0x0, (%rdi)
000000000010ec4b	je	0x10f044
000000000010ec51	movq	%rsi, %r12
000000000010ec54	cmpq	$0x0, (%rsi)
000000000010ec58	je	0x10f044
000000000010ec5e	movq	0x10(%r12), %xmm0
000000000010ec65	movdqu	0x8(%rbx), %xmm3
000000000010ec6a	movl	0x8(%rbx), %ecx
000000000010ec6d	movl	0xc(%rbx), %eax
000000000010ec70	movq	0x8(%r12), %xmm1
000000000010ec77	movdqa	%xmm3, %xmm2
000000000010ec7b	punpcklqdq	%xmm0, %xmm2            ## xmm2 = xmm2[0],xmm0[0]
000000000010ec7f	paddd	0x2c36c9(%rip), %xmm2
000000000010ec87	paddd	%xmm0, %xmm1
000000000010ec8b	pblendw	$0xf, %xmm1, %xmm3              ## xmm3 = xmm1[0,1,2,3],xmm3[4,5,6,7]
000000000010ec91	paddd	%xmm2, %xmm3
000000000010ec95	pextrd	$0x2, %xmm2, %edi
000000000010ec9b	pextrd	$0x3, %xmm2, %r8d
000000000010eca2	psubd	%xmm1, %xmm2
000000000010eca6	pblendw	$0xf0, %xmm3, %xmm2             ## xmm2 = xmm2[0,1,2,3],xmm3[4,5,6,7]
000000000010ecac	movdqa	%xmm2, -0x80(%rbp)
000000000010ecb1	movl	%ecx, %esi
000000000010ecb3	subl	%edi, %esi
000000000010ecb5	movl	%eax, %edx
000000000010ecb7	subl	%r8d, %edx
000000000010ecba	addl	0x10(%rbx), %edi
000000000010ecbd	addl	%edi, %ecx
000000000010ecbf	decl	%ecx
000000000010ecc1	addl	0x14(%rbx), %r8d
000000000010ecc5	movdqa	%xmm3, -0x50(%rbp)
000000000010ecca	pextrd	$0x2, %xmm3, %edi
000000000010ecd0	addl	%eax, %r8d
000000000010ecd3	decl	%r8d
000000000010ecd6	pextrd	$0x3, %xmm3, %r9d
000000000010ecdd	imull	%edi, %r9d
000000000010ece1	movq	%rbx, %rdi
000000000010ece4	callq	__ZN16HGLinearFilter2D6resizeEiiiii ## HGLinearFilter2D::resize(int, int, int, int, int)
000000000010ece9	movslq	0x10(%rbx), %rdx
000000000010eced	movl	0xc(%rbx), %esi
000000000010ecf0	imull	%edx, %esi
000000000010ecf3	addl	0x8(%rbx), %esi
000000000010ecf6	movq	(%rbx), %rdi
000000000010ecf9	movq	$0x0, -0x1e0(%rbp)
000000000010ed04	movdqa	-0x50(%rbp), %xmm0
000000000010ed09	pextrq	$0x1, %xmm0, -0x1d8(%rbp)
000000000010ed14	movq	%rdi, -0x1d0(%rbp)
000000000010ed1b	pextrd	$0x2, %xmm0, -0x1c8(%rbp)
000000000010ed25	movl	%esi, %ecx
000000000010ed27	negl	%ecx
000000000010ed29	movslq	%ecx, %rcx
000000000010ed2c	shlq	$0x4, %rcx
000000000010ed30	addq	%rax, %rcx
000000000010ed33	movq	%rcx, -0x190(%rbp)
000000000010ed3a	movq	%rdx, -0x38(%rbp)
000000000010ed3e	movl	%edx, -0x188(%rbp)
000000000010ed44	movq	(%r12), %r15
000000000010ed48	movslq	0x10(%r12), %r13
000000000010ed4d	movslq	0x14(%r12), %r14
000000000010ed52	cmpq	$0x2, %r13
000000000010ed56	movq	%r12, -0x40(%rbp)
000000000010ed5a	movq	%rsi, -0x50(%rbp)
000000000010ed5e	movq	%rbx, -0x60(%rbp)
000000000010ed62	movq	%rdi, -0x58(%rbp)
000000000010ed66	jl	0x10edf3
000000000010ed6c	cmpl	$0x7, %r13d
000000000010ed70	movq	%r13, -0x30(%rbp)
000000000010ed74	leaq	_cx(%rip), %rax
000000000010ed7b	movslq	%esi, %rdx
000000000010ed7e	leaq	-0x1e0(%rbp), %rdi
000000000010ed85	movq	%r15, %rsi
000000000010ed88	jb	0x10ee7d
000000000010ed8e	callq	*0x20(%rax)
000000000010ed91	movq	%rax, %rcx
000000000010ed94	movl	%ecx, %edx
000000000010ed96	movl	%r13d, %esi
000000000010ed99	subl	%ecx, %esi
000000000010ed9b	cmpl	$0x7, %esi
000000000010ed9e	jl	0x10ee9e
000000000010eda4	leaq	_caddx(%rip), %rax
000000000010edab	movq	0x20(%rax), %rbx
000000000010edaf	movl	%edx, %eax
000000000010edb1	movq	-0x30(%rbp), %r13
000000000010edb5	nopw	%cs:(%rax,%rax)
000000000010edc0	movslq	%ecx, %r12
000000000010edc3	movq	%r12, %rsi
000000000010edc6	shlq	$0x4, %rsi
000000000010edca	addq	%r15, %rsi
000000000010edcd	addl	-0x50(%rbp), %eax
000000000010edd0	movslq	%eax, %rdx
000000000010edd3	leaq	-0x1e0(%rbp), %rdi
000000000010edda	callq	*%rbx
000000000010eddc	addq	%r12, %rax
000000000010eddf	movl	%r13d, %esi
000000000010ede2	subl	%eax, %esi
000000000010ede4	movq	%rax, %rcx
000000000010ede7	movl	%eax, %edx
000000000010ede9	cmpl	$0x6, %esi
000000000010edec	jg	0x10edc0
000000000010edee	jmp	0x10eea1
000000000010edf3	leaq	_cy(%rip), %rax
000000000010edfa	movslq	%esi, %rdx
000000000010edfd	leaq	-0x1e0(%rbp), %rdi
000000000010ee04	cmpl	$0x7, %r14d
000000000010ee08	jl	0x10ee8f
000000000010ee0e	movq	%r15, %rsi
000000000010ee11	callq	*0x20(%rax)
000000000010ee14	movq	%rax, %rcx
000000000010ee17	movl	%ecx, %edx
000000000010ee19	movl	%r14d, %esi
000000000010ee1c	subl	%ecx, %esi
000000000010ee1e	cmpl	$0x7, %esi
000000000010ee21	jl	0x10efeb
000000000010ee27	leaq	_caddy(%rip), %rax
000000000010ee2e	movq	0x20(%rax), %rbx
000000000010ee32	movl	%edx, %eax
000000000010ee34	movq	-0x38(%rbp), %r13
000000000010ee38	nopl	(%rax,%rax)
000000000010ee40	movq	%r14, %r12
000000000010ee43	movslq	%ecx, %r14
000000000010ee46	movq	%r14, %rsi
000000000010ee49	shlq	$0x4, %rsi
000000000010ee4d	addq	%r15, %rsi
000000000010ee50	imull	%r13d, %eax
000000000010ee54	addl	-0x50(%rbp), %eax
000000000010ee57	movslq	%eax, %rdx
000000000010ee5a	leaq	-0x1e0(%rbp), %rdi
000000000010ee61	callq	*%rbx
000000000010ee63	addq	%r14, %rax
000000000010ee66	movq	%r12, %r14
000000000010ee69	movl	%r14d, %esi
000000000010ee6c	subl	%eax, %esi
000000000010ee6e	movq	%rax, %rcx
000000000010ee71	movl	%eax, %edx
000000000010ee73	cmpl	$0x6, %esi
000000000010ee76	jg	0x10ee40
000000000010ee78	jmp	0x10eff2
000000000010ee7d	callq	*(%rax,%r13,8)
000000000010ee81	decl	%r14d
000000000010ee84	movq	-0x40(%rbp), %rdx
000000000010ee88	jne	0x10eed3
000000000010ee8a	jmp	0x10f022
000000000010ee8f	movq	%r15, %rsi
000000000010ee92	callq	*(%rax,%r14,8)
000000000010ee96	movq	%r12, %rdx
000000000010ee99	jmp	0x10f022
000000000010ee9e	movq	%rcx, %rax
000000000010eea1	movslq	%esi, %rcx
000000000010eea4	leaq	_caddx(%rip), %r8
000000000010eeab	movslq	%eax, %rsi
000000000010eeae	shlq	$0x4, %rsi
000000000010eeb2	addq	%r15, %rsi
000000000010eeb5	addl	-0x50(%rbp), %edx
000000000010eeb8	movslq	%edx, %rdx
000000000010eebb	leaq	-0x1e0(%rbp), %rdi
000000000010eec2	callq	*(%r8,%rcx,8)
000000000010eec6	decl	%r14d
000000000010eec9	movq	-0x40(%rbp), %rdx
000000000010eecd	je	0x10f022
000000000010eed3	movq	%r14, %rax
000000000010eed6	leaq	_caddx(%rip), %rdx
000000000010eedd	movq	-0x30(%rbp), %rcx
000000000010eee1	cmpl	$0x7, %ecx
000000000010eee4	jb	0x10efa5
000000000010eeea	movq	0x20(%rdx), %rcx
000000000010eeee	movq	%rcx, -0x68(%rbp)
000000000010eef2	movq	-0x40(%rbp), %rdx
000000000010eef6	movq	-0x38(%rbp), %rcx
000000000010eefa	movq	-0x50(%rbp), %r13
000000000010eefe	movq	-0x30(%rbp), %r12
000000000010ef02	movq	-0x68(%rbp), %rbx
000000000010ef06	nopw	%cs:(%rax,%rax)
000000000010ef10	movq	%rax, -0x50(%rbp)
000000000010ef14	movq	%r15, %rax
000000000010ef17	addl	%ecx, %r13d
000000000010ef1a	movslq	0x10(%rdx), %r15
000000000010ef1e	shlq	$0x4, %r15
000000000010ef22	addq	%rax, %r15
000000000010ef25	xorl	%eax, %eax
000000000010ef27	movq	%r13, %rdi
000000000010ef2a	nopw	(%rax,%rax)
000000000010ef30	movslq	%eax, %r13
000000000010ef33	movq	%r13, %rsi
000000000010ef36	shlq	$0x4, %rsi
000000000010ef3a	addq	%r15, %rsi
000000000010ef3d	leal	(%rdi,%r13), %eax
000000000010ef41	movslq	%eax, %rdx
000000000010ef44	movq	%r15, %r14
000000000010ef47	movq	%rdi, %r15
000000000010ef4a	leaq	-0x1e0(%rbp), %rdi
000000000010ef51	callq	*%rbx
000000000010ef53	movq	%r15, %rdi
000000000010ef56	movq	%r14, %r15
000000000010ef59	addl	%r13d, %eax
000000000010ef5c	movl	%r12d, %ecx
000000000010ef5f	subl	%eax, %ecx
000000000010ef61	cmpl	$0x6, %ecx
000000000010ef64	jg	0x10ef30
000000000010ef66	movslq	%ecx, %rcx
000000000010ef69	movslq	%eax, %rsi
000000000010ef6c	shlq	$0x4, %rsi
000000000010ef70	addq	%r15, %rsi
000000000010ef73	addl	%edi, %eax
000000000010ef75	movslq	%eax, %rdx
000000000010ef78	movq	%rdi, %r13
000000000010ef7b	leaq	-0x1e0(%rbp), %rdi
000000000010ef82	leaq	_caddx(%rip), %rax
000000000010ef89	callq	*(%rax,%rcx,8)
000000000010ef8c	movq	-0x50(%rbp), %rax
000000000010ef90	decl	%eax
000000000010ef92	movq	-0x40(%rbp), %rdx
000000000010ef96	movq	-0x38(%rbp), %rcx
000000000010ef9a	jne	0x10ef10
000000000010efa0	jmp	0x10f022
000000000010efa5	movq	(%rdx,%rcx,8), %rcx
000000000010efa9	movq	%rcx, -0x30(%rbp)
000000000010efad	movslq	-0x50(%rbp), %r12
000000000010efb1	movq	-0x38(%rbp), %r14
000000000010efb5	addq	%r14, %r12
000000000010efb8	movq	-0x40(%rbp), %rdx
000000000010efbc	movq	%rax, %r13
000000000010efbf	nop
000000000010efc0	movslq	0x10(%rdx), %rax
000000000010efc4	shlq	$0x4, %rax
000000000010efc8	addq	%rax, %r15
000000000010efcb	leaq	-0x1e0(%rbp), %rdi
000000000010efd2	movq	%r15, %rsi
000000000010efd5	movq	%rdx, %rbx
000000000010efd8	movq	%r12, %rdx
000000000010efdb	callq	*-0x30(%rbp)
000000000010efde	movq	%rbx, %rdx
000000000010efe1	addq	%r14, %r12
000000000010efe4	decl	%r13d
000000000010efe7	jne	0x10efc0
000000000010efe9	jmp	0x10f022
000000000010efeb	movq	%rcx, %rax
000000000010efee	movq	-0x38(%rbp), %r13
000000000010eff2	movslq	%esi, %rcx
000000000010eff5	leaq	_caddy(%rip), %r8
000000000010effc	cltq
000000000010effe	shlq	$0x4, %rax
000000000010f002	addq	%rax, %r15
000000000010f005	imull	%edx, %r13d
000000000010f009	addl	-0x50(%rbp), %r13d
000000000010f00d	movslq	%r13d, %rdx
000000000010f010	leaq	-0x1e0(%rbp), %rdi
000000000010f017	movq	%r15, %rsi
000000000010f01a	callq	*(%r8,%rcx,8)
000000000010f01e	movq	-0x40(%rbp), %rdx
000000000010f022	movq	-0x60(%rbp), %rbx
000000000010f026	movq	-0x58(%rbp), %rax
000000000010f02a	movq	%rax, (%rbx)
000000000010f02d	movaps	-0x80(%rbp), %xmm0
000000000010f031	movups	%xmm0, 0x8(%rbx)
000000000010f035	movl	0x1c(%rbx), %eax
000000000010f038	andl	0x1c(%rdx), %eax
000000000010f03b	andl	$0x1, %eax
000000000010f03e	orl	$0x2, %eax
000000000010f041	movl	%eax, 0x1c(%rbx)
000000000010f044	movq	%rbx, %rax
000000000010f047	addq	$0x1b8, %rsp                    ## imm = 0x1B8
000000000010f04e	popq	%rbx
000000000010f04f	popq	%r12
000000000010f051	popq	%r13
000000000010f053	popq	%r14
000000000010f055	popq	%r15
000000000010f057	popq	%rbp
000000000010f058	retq
000000000010f059	nopl	(%rax)
