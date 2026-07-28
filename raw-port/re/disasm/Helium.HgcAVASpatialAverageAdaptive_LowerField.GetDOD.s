__ZN39HgcAVASpatialAverageAdaptive_LowerField6GetDODEP10HGRendereri6HGRect:
000000000021ef10	testl	%edx, %edx
000000000021ef12	je	0x21ef51
000000000021ef14	cmpl	$0x1, %edx
000000000021ef17	jne	0x21ef60
000000000021ef19	pushq	%rbp
000000000021ef1a	movq	%rsp, %rbp
000000000021ef1d	pushq	%r14
000000000021ef1f	pushq	%rbx
000000000021ef20	movl	$0xfffffffc, %edi               ## imm = 0xFFFFFFFC
000000000021ef25	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
000000000021ef2a	movl	$0x4, %edx
000000000021ef2f	movq	%rcx, %rbx
000000000021ef32	xorl	%ecx, %ecx
000000000021ef34	movq	%r8, %r14
000000000021ef37	callq	_HGRectMake4i
000000000021ef3c	movq	%rdx, %rcx
000000000021ef3f	movq	%rbx, %rdi
000000000021ef42	movq	%r14, %rsi
000000000021ef45	movq	%rax, %rdx
000000000021ef48	popq	%rbx
000000000021ef49	popq	%r14
000000000021ef4b	popq	%rbp
000000000021ef4c	jmp	_HGRectGrow
000000000021ef51	leaq	_HGRectInfinite(%rip), %rcx
000000000021ef58	movq	(%rcx), %rax
000000000021ef5b	movq	0x8(%rcx), %rdx
000000000021ef5f	retq
000000000021ef60	leaq	_HGRectNull(%rip), %rcx
000000000021ef67	movq	(%rcx), %rax
000000000021ef6a	movq	0x8(%rcx), %rdx
000000000021ef6e	retq
000000000021ef6f	nop
