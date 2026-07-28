__ZN16OZSceneGamutUndoC1EPK7OZScene:
0000000000101560	pushq	%rbp
0000000000101561	movq	%rsp, %rbp
0000000000101564	pushq	%r14
0000000000101566	pushq	%rbx
0000000000101567	movq	%rsi, %rbx
000000000010156a	movq	%rdi, %r14
000000000010156d	leaq	0x73c08c(%rip), %rax
0000000000101574	movq	%rax, (%rdi)
0000000000101577	movq	%rsi, %rdi
000000000010157a	callq	__ZNK7OZScene18getRawWorkingGamutEv ## OZScene::getRawWorkingGamut() const
000000000010157f	movl	%eax, 0x8(%r14)
0000000000101583	movq	%rbx, %rdi
0000000000101586	callq	__ZNK7OZScene27dynamicRangeTrackingEnabledEv ## OZScene::dynamicRangeTrackingEnabled() const
000000000010158b	movb	%al, 0xc(%r14)
000000000010158f	popq	%rbx
0000000000101590	popq	%r14
0000000000101592	popq	%rbp
0000000000101593	retq
0000000000101594	nopw	%cs:(%rax,%rax)
