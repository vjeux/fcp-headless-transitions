__ZN11HDemosaic_26GetROIEP10HGRendereri6HGRect:
00000000000dd7c0	testl	%edx, %edx
00000000000dd7c2	je	0xdd7d3
00000000000dd7c4	leaq	_HGRectNull(%rip), %rcx
00000000000dd7cb	movq	(%rcx), %rax
00000000000dd7ce	movq	0x8(%rcx), %rdx
00000000000dd7d2	retq
00000000000dd7d3	pushq	%rbp
00000000000dd7d4	movq	%rsp, %rbp
00000000000dd7d7	pushq	%r14
00000000000dd7d9	pushq	%rbx
00000000000dd7da	movq	%r8, %rbx
00000000000dd7dd	movq	%rcx, %r14
00000000000dd7e0	movl	$0xffffffff, %edi               ## imm = 0xFFFFFFFF
00000000000dd7e5	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
00000000000dd7ea	movl	$0x1, %edx
00000000000dd7ef	movl	$0x1, %ecx
00000000000dd7f4	callq	_HGRectMake4i
00000000000dd7f9	movq	%rdx, %rcx
00000000000dd7fc	movq	%r14, %rdi
00000000000dd7ff	movq	%rbx, %rsi
00000000000dd802	movq	%rax, %rdx
00000000000dd805	popq	%rbx
00000000000dd806	popq	%r14
00000000000dd808	popq	%rbp
00000000000dd809	jmp	_HGRectGrow
00000000000dd80e	nop
