__ZN8OZSpline8setDirtyEb:
000000000002f620	pushq	%rbp
000000000002f621	movq	%rsp, %rbp
000000000002f624	testl	%esi, %esi
000000000002f626	je	0x2f64f
000000000002f628	movb	$0x1, 0x91(%rdi)
000000000002f62f	movups	0x10(%rdi), %xmm0
000000000002f633	movups	%xmm0, 0x28(%rdi)
000000000002f637	xorps	%xmm0, %xmm0
000000000002f63a	movups	%xmm0, 0x78(%rdi)
000000000002f63e	movq	$0x0, 0x88(%rdi)
000000000002f649	popq	%rbp
000000000002f64a	jmp	__ZN8OZSpline24refreshValidVerticesListEv ## OZSpline::refreshValidVerticesList()
000000000002f64f	movb	$0x0, 0x91(%rdi)
000000000002f656	popq	%rbp
000000000002f657	retq
