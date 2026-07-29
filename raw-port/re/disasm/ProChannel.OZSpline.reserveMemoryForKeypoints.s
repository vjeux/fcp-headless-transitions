__ZN8OZSpline25reserveMemoryForKeypointsEi:
0000000000032288	pushq	%rbp
0000000000032289	movq	%rsp, %rbp
000000000003228c	testl	%esi, %esi
000000000003228e	je	0x3229d
0000000000032290	addq	$0x10, %rdi
0000000000032294	movslq	%esi, %rsi
0000000000032297	popq	%rbp
0000000000032298	jmp	__ZNSt3__16vectorIP8OZVertexNS_9allocatorIS2_EEE7reserveEm ## std::__1::vector<OZVertex*, std::__1::allocator<OZVertex*>>::reserve(unsigned long)
000000000003229d	popq	%rbp
000000000003229e	retq
000000000003229f	nop
