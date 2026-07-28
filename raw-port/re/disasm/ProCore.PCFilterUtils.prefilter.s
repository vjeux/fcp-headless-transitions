__ZN13PCFilterUtils9prefilterEfPKfPPfRK6PCRectIiEPS5_RKS4_IdEPS9_i:
000000000008c7da	pushq	%rbp
000000000008c7db	movq	%rsp, %rbp
000000000008c7de	pushq	%r15
000000000008c7e0	pushq	%r14
000000000008c7e2	pushq	%r13
000000000008c7e4	pushq	%r12
000000000008c7e6	pushq	%rbx
000000000008c7e7	subq	$0x118, %rsp                    ## imm = 0x118
000000000008c7ee	movq	%r9, -0x88(%rbp)
000000000008c7f5	movq	%r8, %r14
000000000008c7f8	movq	%rcx, %r12
000000000008c7fb	movq	%rdx, %r13
000000000008c7fe	movq	%rsi, -0x78(%rbp)
000000000008c802	movq	%rdi, %r15
000000000008c805	leaq	-0x58(%rbp), %rbx
000000000008c809	movd	0x96ecf(%rip), %xmm1
000000000008c811	movq	%rbx, %rdi
000000000008c814	callq	__ZN8PCFilter11makeLanczosEff   ## PCFilter::makeLanczos(float, float)
000000000008c819	movq	(%rbx), %rax
000000000008c81c	movq	%rax, %rdi
000000000008c81f	movq	%rax, -0x70(%rbp)
000000000008c823	testq	%rax, %rax
000000000008c826	jne	0x8c836
000000000008c828	movl	$0x1, %edi
000000000008c82d	callq	__Z28throw_PCNullPointerExceptionb ## throw_PCNullPointerException(bool)
000000000008c832	movq	-0x58(%rbp), %rdi
000000000008c836	callq	__ZNK8PCFilter4sizeEv           ## PCFilter::size() const
000000000008c83b	movq	%r15, -0x48(%rbp)
000000000008c83f	movq	%r12, -0x90(%rbp)
000000000008c846	decl	%eax
000000000008c848	movl	0x8(%r13), %r12d
000000000008c84c	movl	%eax, -0x60(%rbp)
000000000008c84f	addl	%eax, %r12d
000000000008c852	movq	%r13, %r15
000000000008c855	movl	0xc(%r13), %r13d
000000000008c859	movl	%r12d, %eax
000000000008c85c	imull	0x10(%rbp), %eax
000000000008c860	movl	%eax, -0x5c(%rbp)
000000000008c863	imull	%r13d, %eax
000000000008c867	cltq
000000000008c869	leaq	(,%rax,4), %rcx
000000000008c871	testl	%eax, %eax
000000000008c873	movq	$-0x1, %rdi
000000000008c87a	cmovnsq	%rcx, %rdi
000000000008c87e	callq	0xde6c6                         ## symbol stub for: __Znam
000000000008c883	movq	%rax, -0x30(%rbp)
000000000008c887	movq	%r14, -0x80(%rbp)
000000000008c88b	leal	0x1f(%r13), %eax
000000000008c88f	testl	%r13d, %r13d
000000000008c892	cmovnsl	%r13d, %eax
000000000008c896	movl	%eax, %ebx
000000000008c898	sarl	$0x5, %ebx
000000000008c89b	andl	$-0x20, %eax
000000000008c89e	subl	%eax, %r13d
000000000008c8a1	movslq	%ebx, %rax
000000000008c8a4	movq	%rax, -0x40(%rbp)
000000000008c8a8	movl	$0x21, %edi
000000000008c8ad	xorl	%esi, %esi
000000000008c8af	callq	0xde80a                         ## symbol stub for: _dispatch_get_global_queue
000000000008c8b4	movq	%rax, %rsi
000000000008c8b7	movq	0xbb902(%rip), %rax             ## literal pool symbol address: __NSConcreteStackBlock
000000000008c8be	leaq	-0xd8(%rbp), %rdx
000000000008c8c5	movq	%rax, (%rdx)
000000000008c8c8	movl	$0xc0000000, %eax               ## imm = 0xC0000000
000000000008c8cd	movq	%rax, 0x8(%rdx)
000000000008c8d1	leaq	____ZN13PCFilterUtils9prefilterEfPKfPPfRK6PCRectIiEPS5_RKS4_IdEPS9_i_block_invoke(%rip), %rax
000000000008c8d8	movq	%rax, 0x10(%rdx)
000000000008c8dc	leaq	"___block_descriptor_72_e8_v16?0Q8l"(%rip), %rax
000000000008c8e3	movq	%rax, 0x18(%rdx)
000000000008c8e7	movq	-0x70(%rbp), %rax
000000000008c8eb	movq	%rax, 0x20(%rdx)
000000000008c8ef	movq	-0x48(%rbp), %r14
000000000008c8f3	movq	%r14, 0x28(%rdx)
000000000008c8f7	movq	%r15, -0x38(%rbp)
000000000008c8fb	movq	%r15, 0x30(%rdx)
000000000008c8ff	movl	0x10(%rbp), %eax
000000000008c902	movl	%eax, 0x40(%rdx)
000000000008c905	movq	-0x30(%rbp), %rax
000000000008c909	movq	%rax, 0x38(%rdx)
000000000008c90d	movl	%r12d, -0x64(%rbp)
000000000008c911	movl	%r12d, 0x44(%rdx)
000000000008c915	movq	-0x40(%rbp), %rdi
000000000008c919	movq	%rsi, -0x40(%rbp)
000000000008c91d	callq	0xde7ec                         ## symbol stub for: _dispatch_apply
000000000008c922	testl	%r13d, %r13d
000000000008c925	jle	0x8c9ba
000000000008c92b	movq	%r13, %rdx
000000000008c92e	shll	$0x5, %ebx
000000000008c931	movl	%ebx, %eax
000000000008c933	movl	-0x5c(%rbp), %esi
000000000008c936	imull	%esi, %eax
000000000008c939	imull	0x10(%rbp), %ebx
000000000008c93d	movq	-0x38(%rbp), %rcx
000000000008c941	imull	0x8(%rcx), %ebx
000000000008c945	movslq	%ebx, %rcx
000000000008c948	leaq	(%r14,%rcx,4), %rcx
000000000008c94c	movq	%rcx, -0x48(%rbp)
000000000008c950	cltq
000000000008c952	movq	-0x30(%rbp), %rcx
000000000008c956	leaq	(%rcx,%rax,4), %r14
000000000008c95a	movslq	%esi, %r12
000000000008c95d	movl	%edx, %r13d
000000000008c960	shlq	$0x2, %r12
000000000008c964	xorl	%ebx, %ebx
000000000008c966	movq	-0x58(%rbp), %rdi
000000000008c96a	testq	%rdi, %rdi
000000000008c96d	jne	0x8c97d
000000000008c96f	movl	$0x1, %edi
000000000008c974	callq	__Z28throw_PCNullPointerExceptionb ## throw_PCNullPointerException(bool)
000000000008c979	movq	-0x58(%rbp), %rdi
000000000008c97d	movq	-0x38(%rbp), %rax
000000000008c981	movl	0x8(%rax), %edx
000000000008c984	movl	%ebx, %eax
000000000008c986	imull	%edx, %eax
000000000008c989	cltq
000000000008c98b	movq	-0x48(%rbp), %rcx
000000000008c98f	leaq	(%rcx,%rax,4), %rsi
000000000008c993	movl	0x10(%rbp), %r15d
000000000008c997	movl	%r15d, 0x8(%rsp)
000000000008c99c	movl	%r15d, (%rsp)
000000000008c9a0	movl	%r15d, %ecx
000000000008c9a3	movq	%r14, %r8
000000000008c9a6	movl	-0x64(%rbp), %r9d
000000000008c9aa	callq	__ZN8PCFilter8convolveEPKfiiPfiii ## PCFilter::convolve(float const*, int, int, float*, int, int, int)
000000000008c9af	addq	%r12, %r14
000000000008c9b2	addl	%r15d, %ebx
000000000008c9b5	decq	%r13
000000000008c9b8	jne	0x8c966
000000000008c9ba	movl	-0x60(%rbp), %ecx
000000000008c9bd	movl	%ecx, %eax
000000000008c9bf	shrl	$0x1f, %eax
000000000008c9c2	addl	%ecx, %eax
000000000008c9c4	movq	-0x38(%rbp), %r15
000000000008c9c8	movdqu	(%r15), %xmm0
000000000008c9cd	movd	%eax, %xmm1
000000000008c9d1	andl	$-0x2, %eax
000000000008c9d4	psrad	$0x1, %xmm1
000000000008c9d9	pinsrd	$0x1, %eax, %xmm1
000000000008c9df	pshufd	$0x50, %xmm1, %xmm1             ## xmm1 = xmm1[0,0,1,1]
000000000008c9e4	movdqa	%xmm0, %xmm2
000000000008c9e8	psubd	%xmm1, %xmm2
000000000008c9ec	paddd	%xmm1, %xmm0
000000000008c9f0	pextrd	$0x2, %xmm0, %r14d
000000000008c9f7	pblendw	$0xf0, %xmm0, %xmm2             ## xmm2 = xmm2[0,1,2,3],xmm0[4,5,6,7]
000000000008c9fd	pextrd	$0x3, %xmm0, %eax
000000000008ca03	movl	%eax, %ecx
000000000008ca05	imull	%r14d, %ecx
000000000008ca09	orl	%r14d, %eax
000000000008ca0c	movl	$0x0, %eax
000000000008ca11	cmovsl	%eax, %ecx
000000000008ca14	movq	-0x90(%rbp), %r12
000000000008ca1b	movdqu	%xmm2, (%r12)
000000000008ca21	movl	0x10(%rbp), %r13d
000000000008ca25	imull	%r13d, %ecx
000000000008ca29	movslq	%ecx, %rax
000000000008ca2c	leaq	(,%rax,4), %rcx
000000000008ca34	testl	%eax, %eax
000000000008ca36	movq	$-0x1, %rdi
000000000008ca3d	cmovnsq	%rcx, %rdi
000000000008ca41	callq	0xde6c6                         ## symbol stub for: __Znam
000000000008ca46	leal	0x1f(%r14), %ecx
000000000008ca4a	testl	%r14d, %r14d
000000000008ca4d	cmovnsl	%r14d, %ecx
000000000008ca51	movq	-0x78(%rbp), %rsi
000000000008ca55	movq	%rax, (%rsi)
000000000008ca58	movl	%ecx, %ebx
000000000008ca5a	sarl	$0x5, %ebx
000000000008ca5d	andl	$-0x20, %ecx
000000000008ca60	subl	%ecx, %r14d
000000000008ca63	movslq	%ebx, %rdi
000000000008ca66	leaq	-0x128(%rbp), %rdx
000000000008ca6d	movq	0xbb74c(%rip), %rax             ## literal pool symbol address: __NSConcreteStackBlock
000000000008ca74	movq	%rax, (%rdx)
000000000008ca77	movl	$0xc0000000, %eax               ## imm = 0xC0000000
000000000008ca7c	movq	%rax, 0x8(%rdx)
000000000008ca80	leaq	____ZN13PCFilterUtils9prefilterEfPKfPPfRK6PCRectIiEPS5_RKS4_IdEPS9_i_block_invoke_2(%rip), %rax
000000000008ca87	movq	%rax, 0x10(%rdx)
000000000008ca8b	leaq	"___block_descriptor_76_e8_v16?0Q8l"(%rip), %rax
000000000008ca92	movq	%rax, 0x18(%rdx)
000000000008ca96	movq	-0x70(%rbp), %rax
000000000008ca9a	movq	%rax, 0x20(%rdx)
000000000008ca9e	movq	-0x30(%rbp), %rax
000000000008caa2	movq	%rax, 0x28(%rdx)
000000000008caa6	movl	%r13d, 0x48(%rdx)
000000000008caaa	movq	%r15, 0x30(%rdx)
000000000008caae	movq	%r12, 0x38(%rdx)
000000000008cab2	movq	%rsi, 0x40(%rdx)
000000000008cab6	movq	-0x40(%rbp), %rsi
000000000008caba	callq	0xde7ec                         ## symbol stub for: _dispatch_apply
000000000008cabf	testl	%r14d, %r14d
000000000008cac2	jle	0x8cb35
000000000008cac4	movl	0x10(%rbp), %eax
000000000008cac7	imull	%eax, %ebx
000000000008caca	shll	$0x5, %ebx
000000000008cacd	movslq	%ebx, %r15
000000000008cad0	movslq	%eax, %r13
000000000008cad3	movl	%r14d, %r14d
000000000008cad6	shlq	$0x2, %r15
000000000008cada	shlq	$0x2, %r13
000000000008cade	movq	-0x30(%rbp), %rbx
000000000008cae2	movq	-0x58(%rbp), %rdi
000000000008cae6	testq	%rdi, %rdi
000000000008cae9	jne	0x8caf9
000000000008caeb	movl	$0x1, %edi
000000000008caf0	callq	__Z28throw_PCNullPointerExceptionb ## throw_PCNullPointerException(bool)
000000000008caf5	movq	-0x58(%rbp), %rdi
000000000008caf9	leaq	(%rbx,%r15), %rsi
000000000008cafd	movq	-0x38(%rbp), %rax
000000000008cb01	movl	0xc(%rax), %edx
000000000008cb04	movl	0x8(%r12), %ecx
000000000008cb09	movl	0x10(%rbp), %r10d
000000000008cb0d	imull	%r10d, %ecx
000000000008cb11	movq	-0x78(%rbp), %rax
000000000008cb15	movq	(%rax), %r8
000000000008cb18	addq	%r15, %r8
000000000008cb1b	movl	0xc(%r12), %r9d
000000000008cb20	movl	%r10d, 0x8(%rsp)
000000000008cb25	movl	%ecx, (%rsp)
000000000008cb28	callq	__ZN8PCFilter8convolveEPKfiiPfiii ## PCFilter::convolve(float const*, int, int, float*, int, int, int)
000000000008cb2d	addq	%r13, %r15
000000000008cb30	decq	%r14
000000000008cb33	jne	0x8cae2
000000000008cb35	movq	-0x80(%rbp), %rax
000000000008cb39	movups	(%rax), %xmm0
000000000008cb3c	movups	0x10(%rax), %xmm1
000000000008cb40	movq	-0x88(%rbp), %rax
000000000008cb47	movups	%xmm1, 0x10(%rax)
000000000008cb4b	movups	%xmm0, (%rax)
000000000008cb4e	movq	-0x30(%rbp), %rdi
000000000008cb52	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000008cb57	leaq	-0x50(%rbp), %rdi
000000000008cb5b	callq	__ZN13PCSharedCountD1Ev         ## PCSharedCount::~PCSharedCount()
000000000008cb60	addq	$0x118, %rsp                    ## imm = 0x118
000000000008cb67	popq	%rbx
000000000008cb68	popq	%r12
000000000008cb6a	popq	%r13
000000000008cb6c	popq	%r14
000000000008cb6e	popq	%r15
000000000008cb70	popq	%rbp
000000000008cb71	retq
000000000008cb72	jmp	0x8cb7a
000000000008cb74	jmp	0x8cb7a
000000000008cb76	jmp	0x8cb7a
000000000008cb78	jmp	0x8cb7a
000000000008cb7a	movq	%rax, %rbx
000000000008cb7d	leaq	-0x50(%rbp), %rdi
000000000008cb81	callq	__ZN13PCSharedCountD1Ev         ## PCSharedCount::~PCSharedCount()
000000000008cb86	movq	%rbx, %rdi
000000000008cb89	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
