__ZN13HGConvolution19ConvolutionFilter2DE14HGFilterPreset:
00000000001675a0	pushq	%rbp
00000000001675a1	movq	%rsp, %rbp
00000000001675a4	pushq	%rbx
00000000001675a5	pushq	%rax
00000000001675a6	movq	%rdi, %rbx
00000000001675a9	addq	$0x198, %rdi                    ## imm = 0x198
00000000001675b0	movl	$0x4, %edx
00000000001675b5	callq	__ZN16HGLinearFilter2D7setTypeE14HGFilterPresetj ## HGLinearFilter2D::setType(HGFilterPreset, unsigned int)
00000000001675ba	orb	$0x15, 0x1d8(%rbx)
00000000001675c1	movl	$0x1, 0x200(%rbx)
00000000001675cb	addq	$0x8, %rsp
00000000001675cf	popq	%rbx
00000000001675d0	popq	%rbp
00000000001675d1	retq
00000000001675d2	nopw	%cs:(%rax,%rax)
