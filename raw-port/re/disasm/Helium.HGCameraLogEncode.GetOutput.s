__ZN17HGCameraLogEncode9GetOutputEP10HGRenderer:
0000000000105db0	pushq	%rbp
0000000000105db1	movq	%rsp, %rbp
0000000000105db4	pushq	%r15
0000000000105db6	pushq	%r14
0000000000105db8	pushq	%rbx
0000000000105db9	pushq	%rax
0000000000105dba	movq	%rdi, %r14
0000000000105dbd	movq	%rsi, %rdi
0000000000105dc0	movq	%r14, %rsi
0000000000105dc3	xorl	%edx, %edx
0000000000105dc5	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000105dca	movq	%rax, 0x198(%r14)
0000000000105dd1	movl	0x1a0(%r14), %ecx
0000000000105dd8	decl	%ecx
0000000000105dda	cmpl	$0xc, %ecx
0000000000105ddd	ja	0x106058
0000000000105de3	leaq	0x2e6(%rip), %rax
0000000000105dea	movslq	(%rax,%rcx,4), %rcx
0000000000105dee	addq	%rax, %rcx
0000000000105df1	jmpq	*%rcx
0000000000105df3	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000105df8	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105dfd	movq	%rax, %rbx
0000000000105e00	movq	%rax, %rdi
0000000000105e03	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000105e08	leaq	0x912e31(%rip), %rax
0000000000105e0f	movq	%rax, (%rbx)
0000000000105e12	movq	$0x0, 0x198(%rbx)
0000000000105e1d	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000105e22	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105e27	movq	%rax, %r15
0000000000105e2a	movq	%rax, %rdi
0000000000105e2d	callq	__ZN18HgcAppleLog_encodeC1Ev    ## HgcAppleLog_encode::HgcAppleLog_encode()
0000000000105e32	movq	%r15, 0x1a0(%rbx)
0000000000105e39	movq	$0x0, 0x1a8(%rbx)
0000000000105e44	jmp	0x106036
0000000000105e49	movl	$0x1d0, %edi                    ## imm = 0x1D0
0000000000105e4e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105e53	movq	%rax, %rbx
0000000000105e56	movq	%rax, %rdi
0000000000105e59	movl	$0x1, %esi
0000000000105e5e	movl	$0x1, %edx
0000000000105e63	movl	$0x1, %ecx
0000000000105e68	callq	__ZN11HGSonySLog36EncodeC2ENS_16SceneColorimetryENS_14LogColorimetryENS_22CodeValueNormalizationE ## HGSonySLog3::Encode::Encode(HGSonySLog3::SceneColorimetry, HGSonySLog3::LogColorimetry, HGSonySLog3::CodeValueNormalization)
0000000000105e6d	jmp	0x106031
0000000000105e72	movl	$0x1c0, %edi                    ## imm = 0x1C0
0000000000105e77	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105e7c	movq	%rax, %rbx
0000000000105e7f	movq	%rax, %rdi
0000000000105e82	movl	$0x1, %esi
0000000000105e87	movl	$0x1, %edx
0000000000105e8c	movl	$0x1, %ecx
0000000000105e91	movl	$0x1, %r8d
0000000000105e97	callq	__ZN10HGCanonLog6EncodeC2ENS_16SceneColorimetryENS_11LogEncodingENS_14LogColorimetryENS_22CodeValueNormalizationE ## HGCanonLog::Encode::Encode(HGCanonLog::SceneColorimetry, HGCanonLog::LogEncoding, HGCanonLog::LogColorimetry, HGCanonLog::CodeValueNormalization)
0000000000105e9c	jmp	0x106031
0000000000105ea1	movl	$0x1d0, %edi                    ## imm = 0x1D0
0000000000105ea6	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105eab	movq	%rax, %rbx
0000000000105eae	movq	%rax, %rdi
0000000000105eb1	movl	$0x1, %esi
0000000000105eb6	movl	$0x1, %edx
0000000000105ebb	xorl	%ecx, %ecx
0000000000105ebd	callq	__ZN11HGSonySLog36EncodeC2ENS_16SceneColorimetryENS_14LogColorimetryENS_22CodeValueNormalizationE ## HGSonySLog3::Encode::Encode(HGSonySLog3::SceneColorimetry, HGSonySLog3::LogColorimetry, HGSonySLog3::CodeValueNormalization)
0000000000105ec2	jmp	0x106031
0000000000105ec7	movl	$0x1d0, %edi                    ## imm = 0x1D0
0000000000105ecc	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105ed1	movq	%rax, %rbx
0000000000105ed4	movq	%rax, %rdi
0000000000105ed7	movl	$0x1, %esi
0000000000105edc	xorl	%edx, %edx
0000000000105ede	movl	$0x1, %ecx
0000000000105ee3	callq	__ZN11HGSonySLog36EncodeC2ENS_16SceneColorimetryENS_14LogColorimetryENS_22CodeValueNormalizationE ## HGSonySLog3::Encode::Encode(HGSonySLog3::SceneColorimetry, HGSonySLog3::LogColorimetry, HGSonySLog3::CodeValueNormalization)
0000000000105ee8	jmp	0x106031
0000000000105eed	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000105ef2	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105ef7	movq	%rax, %rbx
0000000000105efa	movq	%rax, %rdi
0000000000105efd	movl	$0x1, %esi
0000000000105f02	callq	__ZN13HGBMDFilmGen56EncodeC2ENS_16SceneColorimetryE ## HGBMDFilmGen5::Encode::Encode(HGBMDFilmGen5::SceneColorimetry)
0000000000105f07	jmp	0x106031
0000000000105f0c	movl	$0x1c0, %edi                    ## imm = 0x1C0
0000000000105f11	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105f16	movq	%rax, %rbx
0000000000105f19	movq	%rax, %rdi
0000000000105f1c	movl	$0x1, %esi
0000000000105f21	movl	$0x1, %edx
0000000000105f26	movl	$0x1, %ecx
0000000000105f2b	xorl	%r8d, %r8d
0000000000105f2e	callq	__ZN10HGCanonLog6EncodeC2ENS_16SceneColorimetryENS_11LogEncodingENS_14LogColorimetryENS_22CodeValueNormalizationE ## HGCanonLog::Encode::Encode(HGCanonLog::SceneColorimetry, HGCanonLog::LogEncoding, HGCanonLog::LogColorimetry, HGCanonLog::CodeValueNormalization)
0000000000105f33	jmp	0x106031
0000000000105f38	movl	$0x1c0, %edi                    ## imm = 0x1C0
0000000000105f3d	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105f42	movq	%rax, %rbx
0000000000105f45	movq	%rax, %rdi
0000000000105f48	movl	$0x1, %esi
0000000000105f4d	callq	__ZN11HGNikonNLog6EncodeC2ENS_16SceneColorimetryE ## HGNikonNLog::Encode::Encode(HGNikonNLog::SceneColorimetry)
0000000000105f52	jmp	0x106031
0000000000105f57	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000105f5c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105f61	movq	%rax, %rbx
0000000000105f64	movq	%rax, %rdi
0000000000105f67	movl	$0x1, %esi
0000000000105f6c	movl	$0x1, %edx
0000000000105f71	callq	__ZN10HGAppleLog6EncodeC2ENS_16SceneColorimetryENS_14LogColorimetryE ## HGAppleLog::Encode::Encode(HGAppleLog::SceneColorimetry, HGAppleLog::LogColorimetry)
0000000000105f76	jmp	0x106031
0000000000105f7b	movl	$0x1b0, %edi                    ## imm = 0x1B0
0000000000105f80	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105f85	movq	%rax, %rbx
0000000000105f88	movq	%rax, %rdi
0000000000105f8b	movl	$0x1, %esi
0000000000105f90	callq	__ZN9HGDJIDLog6EncodeC2ENS_16SceneColorimetryE ## HGDJIDLog::Encode::Encode(HGDJIDLog::SceneColorimetry)
0000000000105f95	jmp	0x106031
0000000000105f9a	movl	$0x1c0, %edi                    ## imm = 0x1C0
0000000000105f9f	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105fa4	movq	%rax, %rbx
0000000000105fa7	movq	%rax, %rdi
0000000000105faa	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000105faf	leaq	0x9137ca(%rip), %rax
0000000000105fb6	movq	%rax, (%rbx)
0000000000105fb9	movq	$0x0, 0x198(%rbx)
0000000000105fc4	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000105fc9	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000105fce	movq	%rax, %r15
0000000000105fd1	movq	%rax, %rdi
0000000000105fd4	callq	__ZN18HgcLogVideo_encodeC1Ev    ## HgcLogVideo_encode::HgcLogVideo_encode()
0000000000105fd9	movq	%r15, 0x1a0(%rbx)
0000000000105fe0	movq	$0x0, 0x1a8(%rbx)
0000000000105feb	movl	$0x1, 0x1b0(%rbx)
0000000000105ff5	jmp	0x106036
0000000000105ff7	movl	$0x1d0, %edi                    ## imm = 0x1D0
0000000000105ffc	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000106001	movq	%rax, %rbx
0000000000106004	movq	%rax, %rdi
0000000000106007	movl	$0x1, %esi
000000000010600c	xorl	%edx, %edx
000000000010600e	xorl	%ecx, %ecx
0000000000106010	callq	__ZN11HGSonySLog36EncodeC2ENS_16SceneColorimetryENS_14LogColorimetryENS_22CodeValueNormalizationE ## HGSonySLog3::Encode::Encode(HGSonySLog3::SceneColorimetry, HGSonySLog3::LogColorimetry, HGSonySLog3::CodeValueNormalization)
0000000000106015	jmp	0x106031
0000000000106017	movl	$0x1b0, %edi                    ## imm = 0x1B0
000000000010601c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000106021	movq	%rax, %rbx
0000000000106024	movq	%rax, %rdi
0000000000106027	movl	$0x1, %esi
000000000010602c	callq	__ZN15HGPanasonicVLog6EncodeC2ENS_16SceneColorimetryE ## HGPanasonicVLog::Encode::Encode(HGPanasonicVLog::SceneColorimetry)
0000000000106031	testq	%rbx, %rbx
0000000000106034	je	0x106051
0000000000106036	movq	0x198(%r14), %rdx
000000000010603d	movq	(%rbx), %rax
0000000000106040	movq	%rbx, %rdi
0000000000106043	xorl	%esi, %esi
0000000000106045	callq	*0x78(%rax)
0000000000106048	movq	%rbx, 0x198(%r14)
000000000010604f	jmp	0x106068
0000000000106051	movq	0x198(%r14), %rax
0000000000106058	movq	(%rax), %rcx
000000000010605b	movq	%rax, %rdi
000000000010605e	callq	*0x10(%rcx)
0000000000106061	movq	0x198(%r14), %rbx
0000000000106068	movq	%rbx, %rax
000000000010606b	addq	$0x8, %rsp
000000000010606f	popq	%rbx
0000000000106070	popq	%r14
0000000000106072	popq	%r15
0000000000106074	popq	%rbp
0000000000106075	retq
0000000000106076	jmp	0x106078
0000000000106078	movq	%rax, %r14
000000000010607b	movq	%r15, %rdi
000000000010607e	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000106083	jmp	0x10608a
0000000000106085	jmp	0x106087
0000000000106087	movq	%rax, %r14
000000000010608a	movq	%rbx, %rdi
000000000010608d	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000106092	movq	%rbx, %rdi
0000000000106095	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
000000000010609a	movq	%r14, %rdi
000000000010609d	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001060a2	jmp	0x1060ba
00000000001060a4	jmp	0x1060ba
00000000001060a6	jmp	0x1060ba
00000000001060a8	jmp	0x1060ba
00000000001060aa	jmp	0x1060ba
00000000001060ac	jmp	0x1060ba
00000000001060ae	jmp	0x1060ba
00000000001060b0	jmp	0x1060ba
00000000001060b2	jmp	0x1060ba
00000000001060b4	jmp	0x1060ba
00000000001060b6	jmp	0x1060ba
00000000001060b8	jmp	0x1060ba
00000000001060ba	movq	%rax, %r14
00000000001060bd	movq	%rbx, %rdi
00000000001060c0	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001060c5	movq	%r14, %rdi
00000000001060c8	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001060cd	nopl	(%rax)
00000000001060d0	andl	%ebp, %edi
00000000001060d2	.byte 0xff #bad opcode
00000000001060d3	incl	0x1dfffffe(%rdi)
00000000001060d9	.byte 0xfe #bad opcode
00000000001060da	.byte 0xff #bad opcode
00000000001060db	.byte 0xff #bad opcode
00000000001060dc	cmpb	$-0x2, %al
00000000001060de	.byte 0xff #bad opcode
00000000001060df	jmpq	*-0x54000003(%rdx)
00000000001060e5	.byte 0xfe #bad opcode
00000000001060e6	.byte 0xff #bad opcode
00000000001060e7	decl	%edx
00000000001060e9	.byte 0xfe #bad opcode
00000000001060ea	.byte 0xff #bad opcode
00000000001060eb	ljmpl	*-0x2(%rax)
00000000001060ee	.byte 0xff #bad opcode
00000000001060ef	incl	-0x1(%rdi)
00000000001060f2	.byte 0xff #bad opcode
00000000001060f3	pushq	%rdi
00000000001060f5	std
00000000001060f6	.byte 0xff #bad opcode
00000000001060f7	jmpq	*(%rdi)
00000000001060f9	.byte 0xff #bad opcode
00000000001060fa	.byte 0xff #bad opcode
00000000001060fb	.byte 0xff #bad opcode
00000000001060fc	jns	0x1060fb
00000000001060fe	.byte 0xff #bad opcode
00000000001060ff	callq	*%rcx
0000000000106101	std
0000000000106102	.byte 0xff #bad opcode
0000000000106103	jmpq	*0x66(%rsi)
0000000000106106	nopw	%cs:(%rax,%rax)
