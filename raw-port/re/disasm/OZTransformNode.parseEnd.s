__ZN15OZTransformNode8parseEndER22PCSerializerReadStream:
00000000001ce880	pushq	%rbp
00000000001ce881	movq	%rsp, %rbp
00000000001ce884	pushq	%r14
00000000001ce886	pushq	%rbx
00000000001ce887	movq	%rsi, %rbx
00000000001ce88a	movq	%rdi, %r14
00000000001ce88d	cmpl	$0x2, 0x68(%rsi)
00000000001ce891	ja	0x1ce8a6
00000000001ce893	leaq	0x18e0(%r14), %rsi
00000000001ce89a	leaq	0x9e8(%r14), %rdi
00000000001ce8a1	callq	0x6dd938                        ## symbol stub for: __ZN13OZChannelBaseaSERKS_
00000000001ce8a6	leaq	0x18e0(%r14), %rdi
00000000001ce8ad	movl	$0x2, %esi
00000000001ce8b2	xorl	%edx, %edx
00000000001ce8b4	callq	0x6dd914                        ## symbol stub for: __ZN13OZChannelBase7setFlagEyb
00000000001ce8b9	movq	%r14, %rdi
00000000001ce8bc	movq	%rbx, %rsi
00000000001ce8bf	callq	__ZN11OZSceneNode8parseEndER22PCSerializerReadStream ## OZSceneNode::parseEnd(PCSerializerReadStream&)
00000000001ce8c4	movb	$0x1, %al
00000000001ce8c6	popq	%rbx
00000000001ce8c7	popq	%r14
00000000001ce8c9	popq	%rbp
00000000001ce8ca	retq
00000000001ce8cb	nopl	(%rax,%rax)
