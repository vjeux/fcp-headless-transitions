__ZN7PCBlend21treatsBlackLikeNormalE11PCBlendMode:
000000000001828a	pushq	%rbp
000000000001828b	movq	%rsp, %rbp
000000000001828e	pushq	%r14
0000000000018290	pushq	%rbx
0000000000018291	movl	%edi, %ecx
0000000000018293	movabsq	$0xfffcdbedfdf7d, %rax          ## imm = 0xFFFCDBEDFDF7D
000000000001829d	shrq	%cl, %rax
00000000000182a0	cmpl	$0x33, %edi
00000000000182a3	ja	0x182ba
00000000000182a5	testb	$0x1, %al
00000000000182a7	je	0x182ba
00000000000182a9	movl	$0x1417d, %eax                  ## imm = 0x1417D
00000000000182ae	btq	%rcx, %rax
00000000000182b2	setb	%al
00000000000182b5	popq	%rbx
00000000000182b6	popq	%r14
00000000000182b8	popq	%rbp
00000000000182b9	retq
00000000000182ba	movl	$0x40, %edi
00000000000182bf	callq	0xde6de                         ## symbol stub for: ___cxa_allocate_exception
00000000000182c4	movq	%rax, %rbx
00000000000182c7	movq	%rax, %rdi
00000000000182ca	callq	__ZN26PCIllegalArgumentExceptionC1Ev ## PCIllegalArgumentException::PCIllegalArgumentException()
00000000000182cf	movq	%rbx, %rdi
00000000000182d2	callq	__ZN7PCBlend13isAssociativeE11PCBlendMode.cold.1 ## PCBlend::isAssociative(PCBlendMode) (.cold.1)
00000000000182d7	movq	%rax, %r14
00000000000182da	movq	%rbx, %rdi
00000000000182dd	callq	0xde6fc                         ## symbol stub for: ___cxa_free_exception
00000000000182e2	movq	%r14, %rdi
00000000000182e5	callq	0xde50a                         ## symbol stub for: __Unwind_Resume
