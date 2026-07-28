__ZN39HgcAVASpatialAverageAdaptive_LowerField6GetROIEP10HGRendereri6HGRect:
000000000021ef70	pushq	%rbp
000000000021ef71	movq	%rsp, %rbp
000000000021ef74	pushq	%r14
000000000021ef76	pushq	%rbx
000000000021ef77	testl	%edx, %edx
000000000021ef79	je	0x21efb1
000000000021ef7b	cmpl	$0x1, %edx
000000000021ef7e	jne	0x21efd3
000000000021ef80	movl	$0xfffffffc, %edi               ## imm = 0xFFFFFFFC
000000000021ef85	movl	$0xffffffff, %esi               ## imm = 0xFFFFFFFF
000000000021ef8a	movl	$0x4, %edx
000000000021ef8f	movq	%rcx, %rbx
000000000021ef92	xorl	%ecx, %ecx
000000000021ef94	movq	%r8, %r14
000000000021ef97	callq	_HGRectMake4i
000000000021ef9c	movq	%rdx, %rcx
000000000021ef9f	movq	%rbx, %rdi
000000000021efa2	movq	%r14, %rsi
000000000021efa5	movq	%rax, %rdx
000000000021efa8	popq	%rbx
000000000021efa9	popq	%r14
000000000021efab	popq	%rbp
000000000021efac	jmp	_HGRectGrow
000000000021efb1	movq	%rdi, %rax
000000000021efb4	movq	%rsi, %rdi
000000000021efb7	movq	%rsi, %rbx
000000000021efba	movq	%rax, %rsi
000000000021efbd	xorl	%edx, %edx
000000000021efbf	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
000000000021efc4	movq	%rbx, %rdi
000000000021efc7	movq	%rax, %rsi
000000000021efca	popq	%rbx
000000000021efcb	popq	%r14
000000000021efcd	popq	%rbp
000000000021efce	jmp	__ZN10HGRenderer6GetDODEP6HGNode ## HGRenderer::GetDOD(HGNode*)
000000000021efd3	leaq	_HGRectNull(%rip), %rcx
000000000021efda	movq	(%rcx), %rax
000000000021efdd	movq	0x8(%rcx), %rdx
000000000021efe1	popq	%rbx
000000000021efe2	popq	%r14
000000000021efe4	popq	%rbp
000000000021efe5	retq
000000000021efe6	nopw	%cs:(%rax,%rax)
