__ZN19OZChannelRotation3D8parseEndER22PCSerializerReadStream:
0000000000082926	pushq	%rbp
0000000000082927	movq	%rsp, %rbp
000000000008292a	pushq	%rbx
000000000008292b	pushq	%rax
000000000008292c	movq	%rdi, %rbx
000000000008292f	callq	__ZN15OZChannelFolder8parseEndER22PCSerializerReadStream ## OZChannelFolder::parseEnd(PCSerializerReadStream&)
0000000000082934	movq	%rbx, %rdi
0000000000082937	callq	__ZN19OZChannelRotation3D23interpolationModeWasSetEv ## OZChannelRotation3D::interpolationModeWasSet()
000000000008293c	movb	$0x1, %al
000000000008293e	addq	$0x8, %rsp
0000000000082942	popq	%rbx
0000000000082943	popq	%rbp
0000000000082944	retq
0000000000082945	nop
