__ZN20HGLensDistort_kernel4BindEP9HGHandler:
000000000022a780	pushq	%rbp
000000000022a781	movq	%rsp, %rbp
000000000022a784	pushq	%r14
000000000022a786	pushq	%rbx
000000000022a787	movq	%rsi, %rbx
000000000022a78a	movq	%rdi, %r14
000000000022a78d	movq	%rsi, %rdi
000000000022a790	xorl	%esi, %esi
000000000022a792	xorl	%edx, %edx
000000000022a794	xorl	%ecx, %ecx
000000000022a796	xorl	%r8d, %r8d
000000000022a799	callq	__ZN9HGHandler8TexCoordEiiiPKd  ## HGHandler::TexCoord(int, int, int, double const*)
000000000022a79e	movq	0x1f0(%r14), %rdx
000000000022a7a5	movq	(%rbx), %rax
000000000022a7a8	movq	%rbx, %rdi
000000000022a7ab	xorl	%esi, %esi
000000000022a7ad	movl	$0x1, %ecx
000000000022a7b2	callq	*0x90(%rax)
000000000022a7b8	movq	0x1f0(%r14), %rdx
000000000022a7bf	addq	$0x20, %rdx
000000000022a7c3	movq	(%rbx), %rax
000000000022a7c6	movq	%rbx, %rdi
000000000022a7c9	movl	$0x1, %esi
000000000022a7ce	movl	$0x1, %ecx
000000000022a7d3	callq	*0x90(%rax)
000000000022a7d9	movq	0x1f0(%r14), %rdx
000000000022a7e0	addq	$0x40, %rdx
000000000022a7e4	movq	(%rbx), %rax
000000000022a7e7	movq	%rbx, %rdi
000000000022a7ea	movl	$0x2, %esi
000000000022a7ef	movl	$0x1, %ecx
000000000022a7f4	callq	*0x90(%rax)
000000000022a7fa	movq	0x1f0(%r14), %rdx
000000000022a801	addq	$0x60, %rdx
000000000022a805	movq	(%rbx), %rax
000000000022a808	movq	%rbx, %rdi
000000000022a80b	movl	$0x3, %esi
000000000022a810	movl	$0x1, %ecx
000000000022a815	callq	*0x90(%rax)
000000000022a81b	xorl	%eax, %eax
000000000022a81d	popq	%rbx
000000000022a81e	popq	%r14
000000000022a820	popq	%rbp
000000000022a821	retq
000000000022a822	nopw	%cs:(%rax,%rax)
