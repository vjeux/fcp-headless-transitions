__ZN13PCFilterUtils13prefilter_dspEPKfPPfRK6PCRectIiES7_P8PCFilter:
000000000008c416	pushq	%rbp
000000000008c417	movq	%rsp, %rbp
000000000008c41a	pushq	%r15
000000000008c41c	pushq	%r14
000000000008c41e	pushq	%r13
000000000008c420	pushq	%r12
000000000008c422	pushq	%rbx
000000000008c423	subq	$0x108, %rsp                    ## imm = 0x108
000000000008c42a	movq	%r8, %r13
000000000008c42d	movq	%rcx, %r14
000000000008c430	movq	%rdx, %r15
000000000008c433	movq	%rsi, -0x80(%rbp)
000000000008c437	movq	%rdi, -0x68(%rbp)
000000000008c43b	movl	0x8(%rdx), %ebx
000000000008c43e	movq	%r8, %rdi
000000000008c441	movq	%r8, -0x50(%rbp)
000000000008c445	callq	__ZNK8PCFilter4sizeEv           ## PCFilter::size() const
000000000008c44a	addl	%eax, %ebx
000000000008c44c	decl	%ebx
000000000008c44e	movslq	0xc(%r15), %rax
000000000008c452	movslq	%ebx, %r12
000000000008c455	imulq	%r12, %rax
000000000008c459	movl	0x8(%r14), %ecx
000000000008c45d	movl	0xc(%r14), %edx
000000000008c461	movl	%edx, %edi
000000000008c463	imull	%ecx, %edi
000000000008c466	xorl	%esi, %esi
000000000008c468	orl	%edx, %ecx
000000000008c46a	cmovsl	%esi, %edi
000000000008c46d	movl	%edi, -0x60(%rbp)
000000000008c470	movq	%rax, %rdi
000000000008c473	shlq	$0x2, %rdi
000000000008c477	testl	%eax, %eax
000000000008c479	movq	$-0x1, %rax
000000000008c480	cmovsq	%rax, %rdi
000000000008c484	callq	0xde6c6                         ## symbol stub for: __Znam
000000000008c489	movq	%rax, -0x38(%rbp)
000000000008c48d	movq	%r13, %rdi
000000000008c490	callq	__ZNK8PCFilter4sizeEv           ## PCFilter::size() const
000000000008c495	addl	$0x2, %eax
000000000008c498	andl	$-0x4, %eax
000000000008c49b	movq	%r14, -0x88(%rbp)
000000000008c4a2	movl	0xc(%r14), %ecx
000000000008c4a6	cmpl	%ecx, %r12d
000000000008c4a9	movl	%ebx, -0x2c(%rbp)
000000000008c4ac	cmovgl	%ebx, %ecx
000000000008c4af	addl	%eax, %ecx
000000000008c4b1	movq	%rcx, -0x70(%rbp)
000000000008c4b5	movslq	%ecx, %rax
000000000008c4b8	leaq	(,%rax,4), %rdi
000000000008c4c0	testl	%eax, %eax
000000000008c4c2	movq	$-0x1, %rax
000000000008c4c9	cmovsq	%rax, %rdi
000000000008c4cd	callq	0xde6c6                         ## symbol stub for: __Znam
000000000008c4d2	movq	%rax, -0x58(%rbp)
000000000008c4d6	movl	0xc(%r15), %r13d
000000000008c4da	leaq	-0x98(%rbp), %rdx
000000000008c4e1	movq	$0x4, (%rdx)
000000000008c4e8	leaq	0xa785d(%rip), %rdi             ## literal pool for: "hw.logicalcpu"
000000000008c4ef	leaq	-0x8c(%rbp), %rbx
000000000008c4f6	movq	%rbx, %rsi
000000000008c4f9	xorl	%ecx, %ecx
000000000008c4fb	xorl	%r8d, %r8d
000000000008c4fe	callq	0xdebbe                         ## symbol stub for: _sysctlbyname
000000000008c503	movl	%r13d, %eax
000000000008c506	cltd
000000000008c507	idivl	(%rbx)
000000000008c509	cmpl	$0x2, %eax
000000000008c50c	movl	$0x1, %ebx
000000000008c511	cmovgel	%eax, %ebx
000000000008c514	movl	0xc(%r15), %eax
000000000008c518	cltd
000000000008c519	idivl	%ebx
000000000008c51b	movl	%edx, %r14d
000000000008c51e	movl	%eax, -0x5c(%rbp)
000000000008c521	movslq	%eax, %r13
000000000008c524	xorl	%edi, %edi
000000000008c526	xorl	%esi, %esi
000000000008c528	callq	0xde80a                         ## symbol stub for: _dispatch_get_global_queue
000000000008c52d	movq	%rax, %rsi
000000000008c530	movq	0xbbc89(%rip), %rax             ## literal pool symbol address: __NSConcreteStackBlock
000000000008c537	leaq	-0xe0(%rbp), %rdx
000000000008c53e	movq	%rax, (%rdx)
000000000008c541	movl	$0xc0000000, %eax               ## imm = 0xC0000000
000000000008c546	movq	%rax, 0x8(%rdx)
000000000008c54a	leaq	____ZN13PCFilterUtils13prefilter_dspEPKfPPfRK6PCRectIiES7_P8PCFilter_block_invoke(%rip), %rax
000000000008c551	movq	%rax, 0x10(%rdx)
000000000008c555	leaq	"___block_descriptor_72_e8_v16?0Q8l"(%rip), %rax
000000000008c55c	movq	%rax, 0x18(%rdx)
000000000008c560	movq	-0x50(%rbp), %rax
000000000008c564	movq	%rax, 0x20(%rdx)
000000000008c568	movq	-0x68(%rbp), %rax
000000000008c56c	movq	%rax, 0x28(%rdx)
000000000008c570	movq	%r15, -0x48(%rbp)
000000000008c574	movq	%r15, 0x30(%rdx)
000000000008c578	movl	%ebx, -0x3c(%rbp)
000000000008c57b	movl	%ebx, 0x40(%rdx)
000000000008c57e	movq	-0x38(%rbp), %rax
000000000008c582	movq	%rax, 0x38(%rdx)
000000000008c586	movq	%r12, %rbx
000000000008c589	movl	%r12d, 0x44(%rdx)
000000000008c58d	movq	%r13, %rdi
000000000008c590	movq	%rsi, -0x78(%rbp)
000000000008c594	callq	0xde7ec                         ## symbol stub for: _dispatch_apply
000000000008c599	testl	%r14d, %r14d
000000000008c59c	jle	0x8c61b
000000000008c59e	movl	%r14d, %edx
000000000008c5a1	movl	-0x5c(%rbp), %esi
000000000008c5a4	imull	-0x3c(%rbp), %esi
000000000008c5a8	movq	-0x48(%rbp), %rax
000000000008c5ac	movslq	0x8(%rax), %rax
000000000008c5b0	movslq	%esi, %rcx
000000000008c5b3	imull	-0x2c(%rbp), %esi
000000000008c5b7	imulq	%rax, %rcx
000000000008c5bb	movq	-0x68(%rbp), %rax
000000000008c5bf	leaq	(%rax,%rcx,4), %r14
000000000008c5c3	movslq	%esi, %rax
000000000008c5c6	movq	-0x38(%rbp), %rcx
000000000008c5ca	leaq	(%rcx,%rax,4), %r13
000000000008c5ce	movl	%edx, %r15d
000000000008c5d1	shlq	$0x2, %rbx
000000000008c5d5	xorl	%r12d, %r12d
000000000008c5d8	movq	-0x48(%rbp), %rax
000000000008c5dc	movslq	0x8(%rax), %rdx
000000000008c5e0	movq	%rdx, %rax
000000000008c5e3	imulq	%r12, %rax
000000000008c5e7	leaq	(%r14,%rax,4), %rsi
000000000008c5eb	subq	$0x8, %rsp
000000000008c5ef	movq	-0x50(%rbp), %rdi
000000000008c5f3	movl	$0x1, %ecx
000000000008c5f8	movq	%r13, %r8
000000000008c5fb	movl	-0x2c(%rbp), %r9d
000000000008c5ff	pushq	-0x70(%rbp)
000000000008c602	pushq	-0x58(%rbp)
000000000008c605	pushq	$0x1
000000000008c607	callq	__ZN8PCFilter12convolve_dspEPKfiiPfiiS2_i ## PCFilter::convolve_dsp(float const*, int, int, float*, int, int, float*, int)
000000000008c60c	addq	$0x20, %rsp
000000000008c610	incq	%r12
000000000008c613	addq	%rbx, %r13
000000000008c616	cmpq	%r12, %r15
000000000008c619	jne	0x8c5d8
000000000008c61b	movslq	-0x60(%rbp), %rax
000000000008c61f	leaq	(,%rax,4), %rdi
000000000008c627	testl	%eax, %eax
000000000008c629	movq	$-0x1, %rax
000000000008c630	cmovsq	%rax, %rdi
000000000008c634	callq	0xde6c6                         ## symbol stub for: __Znam
000000000008c639	movq	-0x80(%rbp), %rcx
000000000008c63d	movq	%rax, (%rcx)
000000000008c640	movq	-0x88(%rbp), %r13
000000000008c647	movl	0x8(%r13), %eax
000000000008c64b	cltd
000000000008c64c	movl	-0x3c(%rbp), %r15d
000000000008c650	idivl	%r15d
000000000008c653	movl	%edx, -0x2c(%rbp)
000000000008c656	movl	%eax, %r14d
000000000008c659	movslq	%eax, %rdi
000000000008c65c	leaq	-0x130(%rbp), %rdx
000000000008c663	movq	0xbbb56(%rip), %rax             ## literal pool symbol address: __NSConcreteStackBlock
000000000008c66a	movq	%rax, (%rdx)
000000000008c66d	movl	$0xc0000000, %eax               ## imm = 0xC0000000
000000000008c672	movq	%rax, 0x8(%rdx)
000000000008c676	leaq	____ZN13PCFilterUtils13prefilter_dspEPKfPPfRK6PCRectIiES7_P8PCFilter_block_invoke_2(%rip), %rax
000000000008c67d	movq	%rax, 0x10(%rdx)
000000000008c681	leaq	"___block_descriptor_76_e8_v16?0Q8l"(%rip), %rax
000000000008c688	movq	%rax, 0x18(%rdx)
000000000008c68c	movq	-0x50(%rbp), %r12
000000000008c690	movq	%r12, 0x20(%rdx)
000000000008c694	movq	-0x38(%rbp), %rax
000000000008c698	movq	%rax, 0x28(%rdx)
000000000008c69c	movl	%r15d, 0x48(%rdx)
000000000008c6a0	movq	-0x48(%rbp), %rax
000000000008c6a4	movq	%rax, 0x30(%rdx)
000000000008c6a8	movq	%r13, 0x38(%rdx)
000000000008c6ac	movq	%rcx, %rbx
000000000008c6af	movq	%rcx, 0x40(%rdx)
000000000008c6b3	movq	-0x78(%rbp), %rsi
000000000008c6b7	callq	0xde7ec                         ## symbol stub for: _dispatch_apply
000000000008c6bc	movl	-0x2c(%rbp), %eax
000000000008c6bf	testl	%eax, %eax
000000000008c6c1	jle	0x8c70e
000000000008c6c3	imull	%r15d, %r14d
000000000008c6c7	movslq	%r14d, %r14
000000000008c6ca	movl	%eax, %r15d
000000000008c6cd	shlq	$0x2, %r14
000000000008c6d1	movq	-0x38(%rbp), %rax
000000000008c6d5	leaq	(%rax,%r14), %rsi
000000000008c6d9	movq	-0x48(%rbp), %rax
000000000008c6dd	movl	0xc(%rax), %edx
000000000008c6e0	movq	(%rbx), %r8
000000000008c6e3	addq	%r14, %r8
000000000008c6e6	movl	0x8(%r13), %ecx
000000000008c6ea	movl	0xc(%r13), %r9d
000000000008c6ee	subq	$0x8, %rsp
000000000008c6f2	movq	%r12, %rdi
000000000008c6f5	pushq	-0x70(%rbp)
000000000008c6f8	pushq	-0x58(%rbp)
000000000008c6fb	pushq	%rcx
000000000008c6fc	callq	__ZN8PCFilter12convolve_dspEPKfiiPfiiS2_i ## PCFilter::convolve_dsp(float const*, int, int, float*, int, int, float*, int)
000000000008c701	addq	$0x20, %rsp
000000000008c705	addq	$0x4, %r14
000000000008c709	decq	%r15
000000000008c70c	jne	0x8c6d1
000000000008c70e	movq	-0x58(%rbp), %rdi
000000000008c712	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000008c717	movq	-0x38(%rbp), %rdi
000000000008c71b	callq	0xde6ba                         ## symbol stub for: __ZdaPv
000000000008c720	addq	$0x108, %rsp                    ## imm = 0x108
000000000008c727	popq	%rbx
000000000008c728	popq	%r12
000000000008c72a	popq	%r13
000000000008c72c	popq	%r14
000000000008c72e	popq	%r15
000000000008c730	popq	%rbp
000000000008c731	retq
