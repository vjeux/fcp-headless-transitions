__ZN23HGCSimpleSpatialDenoise6GetROIEP10HGRendereri6HGRect:
00000000001c8730	testl	%edx, %edx
00000000001c8732	je	0x1c8743
00000000001c8734	leaq	_HGRectNull(%rip), %rcx
00000000001c873b	movq	(%rcx), %rax
00000000001c873e	movq	0x8(%rcx), %rdx
00000000001c8742	retq
00000000001c8743	pushq	%rbp
00000000001c8744	movq	%rsp, %rbp
00000000001c8747	pushq	%r14
00000000001c8749	pushq	%rbx
00000000001c874a	movq	%r8, %rbx
00000000001c874d	movq	%rcx, %r14
00000000001c8750	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
00000000001c8755	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000001c875a	movl	$0x1, %edx
00000000001c875f	movl	$0x1, %ecx
00000000001c8764	callq	_HGRectMake4i
00000000001c8769	movq	%rdx, %rcx
00000000001c876c	movq	%r14, %rdi
00000000001c876f	movq	%rbx, %rsi
00000000001c8772	movq	%rax, %rdx
00000000001c8775	popq	%rbx
00000000001c8776	popq	%r14
00000000001c8778	popq	%rbp
00000000001c8779	jmp	_HGRectGrow
00000000001c877e	addb	%al, (%rax)
