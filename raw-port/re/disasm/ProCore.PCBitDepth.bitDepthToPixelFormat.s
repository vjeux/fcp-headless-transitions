__ZN10PCBitDepth21bitDepthToPixelFormatENS_4TypeE:
00000000000357de	pushq	%rbp
00000000000357df	movq	%rsp, %rbp
00000000000357e2	xorl	%eax, %eax
00000000000357e4	cmpl	$0x3, %edi
00000000000357e7	ja	0x357f5
00000000000357e9	movl	%edi, %eax
00000000000357eb	leaq	0xee81e(%rip), %rcx
00000000000357f2	movl	(%rcx,%rax,4), %eax
00000000000357f5	popq	%rbp
00000000000357f6	retq
00000000000357f7	addb	%dl, 0x48(%rbp)
00000000000357fa	movl	%esp, %ebp
00000000000357fc	pushq	%r14
00000000000357fe	pushq	%rbx
00000000000357ff	movl	%esi, %ebx
0000000000035801	movq	%rdi, %r14
0000000000035804	testq	%rdi, %rdi
0000000000035807	jne	0x35833
0000000000035809	movl	%ebx, %edi
000000000003580b	callq	__ZN13PCPixelFormat6hasRGBENS_12ChannelOrderE ## PCPixelFormat::hasRGB(PCPixelFormat::ChannelOrder)
0000000000035810	testb	%al, %al
0000000000035812	je	0x3581b
0000000000035814	callq	__ZN6PCInfo25getDefaultRGBCGColorSpaceEv ## PCInfo::getDefaultRGBCGColorSpace()
0000000000035819	jmp	0x3582b
000000000003581b	movl	%ebx, %edi
000000000003581d	callq	__ZN13PCPixelFormat7hasGrayENS_12ChannelOrderE ## PCPixelFormat::hasGray(PCPixelFormat::ChannelOrder)
0000000000035822	testb	%al, %al
0000000000035824	je	0x35830
0000000000035826	callq	__ZN6PCInfo31getDefaultGrayscaleCGColorSpaceEv ## PCInfo::getDefaultGrayscaleCGColorSpace()
000000000003582b	movq	%rax, %r14
000000000003582e	jmp	0x35833
0000000000035830	xorl	%r14d, %r14d
0000000000035833	movl	%ebx, %edi
0000000000035835	callq	__ZN13PCPixelFormat6hasRGBENS_12ChannelOrderE ## PCPixelFormat::hasRGB(PCPixelFormat::ChannelOrder)
000000000003583a	testb	%al, %al
000000000003583c	jne	0x3584d
000000000003583e	movl	%ebx, %edi
0000000000035840	callq	__ZN13PCPixelFormat7hasGrayENS_12ChannelOrderE ## PCPixelFormat::hasGray(PCPixelFormat::ChannelOrder)
0000000000035845	xorl	%ecx, %ecx
0000000000035847	testb	%al, %al
0000000000035849	cmoveq	%rcx, %r14
000000000003584d	movq	%r14, %rax
0000000000035850	popq	%rbx
0000000000035851	popq	%r14
0000000000035853	popq	%rbp
0000000000035854	retq
0000000000035855	nop
