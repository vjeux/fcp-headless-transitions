__ZN21HGDenoisePDEIteration12SetParameterEiffff:
00000000001c2b60	pushq	%rbp
00000000001c2b61	movq	%rsp, %rbp
00000000001c2b64	testl	%esi, %esi
00000000001c2b66	je	0x1c2b6f
00000000001c2b68	movl	$0xffffffff, %eax               ## imm = 0xFFFFFFFF
00000000001c2b6d	popq	%rbp
00000000001c2b6e	retq
00000000001c2b6f	xorl	%esi, %esi
00000000001c2b71	movaps	%xmm0, %xmm1
00000000001c2b74	movaps	%xmm0, %xmm2
00000000001c2b77	movaps	%xmm0, %xmm3
00000000001c2b7a	popq	%rbp
00000000001c2b7b	jmp	__ZN6HGNode12SetParameterEiffff ## HGNode::SetParameter(int, float, float, float, float)
