__ZN38HGAVASpatialAverageAdaptive_LowerField6GetROIEP10HGRendereri6HGRect:
0000000000221fa0	pushq	%rbp
0000000000221fa1	movq	%rsp, %rbp
0000000000221fa4	pushq	%r14
0000000000221fa6	pushq	%rbx
0000000000221fa7	movq	%r8, %rbx
0000000000221faa	movq	%rcx, %r14
0000000000221fad	testl	%edx, %edx
0000000000221faf	je	0x221fc9
0000000000221fb1	cmpl	$0x1, %edx
0000000000221fb4	jne	0x221ff7
0000000000221fb6	movl	$0xfffffffb, %edi               ## imm = 0xFFFFFFFB
0000000000221fbb	movl	$0xfffffffe, %esi               ## imm = 0xFFFFFFFE
0000000000221fc0	movl	$0x4, %edx
0000000000221fc5	xorl	%ecx, %ecx
0000000000221fc7	jmp	0x221fdd
0000000000221fc9	movl	$0xfffffffc, %edi               ## imm = 0xFFFFFFFC
0000000000221fce	movl	$0xfffffffe, %esi               ## imm = 0xFFFFFFFE
0000000000221fd3	movl	$0x4, %edx
0000000000221fd8	movl	$0x1, %ecx
0000000000221fdd	callq	_HGRectMake4i
0000000000221fe2	movq	%rdx, %rcx
0000000000221fe5	movq	%r14, %rdi
0000000000221fe8	movq	%rbx, %rsi
0000000000221feb	movq	%rax, %rdx
0000000000221fee	popq	%rbx
0000000000221fef	popq	%r14
0000000000221ff1	popq	%rbp
0000000000221ff2	jmp	_HGRectGrow
0000000000221ff7	leaq	_HGRectNull(%rip), %rcx
0000000000221ffe	movq	(%rcx), %rax
0000000000222001	movq	0x8(%rcx), %rdx
0000000000222005	popq	%rbx
0000000000222006	popq	%r14
0000000000222008	popq	%rbp
0000000000222009	retq
000000000022200a	nopw	(%rax,%rax)
