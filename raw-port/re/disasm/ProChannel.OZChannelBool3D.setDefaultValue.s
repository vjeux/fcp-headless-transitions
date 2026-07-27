__ZN15OZChannelBool3D15setDefaultValueEbbb:
00000000000538e4	pushq	%rbp
00000000000538e5	movq	%rsp, %rbp
00000000000538e8	pushq	%r15
00000000000538ea	pushq	%r14
00000000000538ec	pushq	%rbx
00000000000538ed	pushq	%rax
00000000000538ee	movl	%ecx, %ebx
00000000000538f0	movl	%edx, %r14d
00000000000538f3	movq	%rdi, %r15
00000000000538f6	addq	$0x88, %rdi
00000000000538fd	cvtsi2sd	%esi, %xmm0
0000000000053901	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
0000000000053906	leaq	0x120(%r15), %rdi
000000000005390d	xorps	%xmm0, %xmm0
0000000000053910	cvtsi2sd	%r14d, %xmm0
0000000000053915	callq	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
000000000005391a	addq	$0x1b8, %r15                    ## imm = 0x1B8
0000000000053921	xorps	%xmm0, %xmm0
0000000000053924	cvtsi2sd	%ebx, %xmm0
0000000000053928	movq	%r15, %rdi
000000000005392b	addq	$0x8, %rsp
000000000005392f	popq	%rbx
0000000000053930	popq	%r14
0000000000053932	popq	%r15
0000000000053934	popq	%rbp
0000000000053935	jmp	__ZN9OZChannel15setDefaultValueEd ## OZChannel::setDefaultValue(double)
