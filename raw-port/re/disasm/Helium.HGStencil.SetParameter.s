__ZN9HGStencil12SetParameterEiffff:
00000000002d21b0	pushq	%rbp
00000000002d21b1	movq	%rsp, %rbp
00000000002d21b4	cmpl	$0x1, %esi
00000000002d21b7	je	0x2d21d1
00000000002d21b9	xorl	%eax, %eax
00000000002d21bb	testl	%esi, %esi
00000000002d21bd	jne	0x2d21de
00000000002d21bf	roundss	$0x9, %xmm0, %xmm0
00000000002d21c5	cvttss2si	%xmm0, %eax
00000000002d21c9	movl	%eax, 0x1b4(%rdi)
00000000002d21cf	jmp	0x2d21d9
00000000002d21d1	movss	%xmm0, 0x1b0(%rdi)
00000000002d21d9	movl	$0x1, %eax
00000000002d21de	popq	%rbp
00000000002d21df	retq
