__ZN11HGPBOBitmapC1EP16HGPixelBufferObj:
00000000000a1260	pushq	%rbp
00000000000a1261	movq	%rsp, %rbp
00000000000a1264	pushq	%r15
00000000000a1266	pushq	%r14
00000000000a1268	pushq	%r13
00000000000a126a	pushq	%r12
00000000000a126c	pushq	%rbx
00000000000a126d	pushq	%rax
00000000000a126e	movq	%rsi, %r14
00000000000a1271	movq	%rdi, %rbx
00000000000a1274	movq	%rsi, %rdi
00000000000a1277	callq	__ZNK16HGPixelBufferObj4rectEv  ## HGPixelBufferObj::rect() const
00000000000a127c	movq	%rax, -0x30(%rbp)
00000000000a1280	movq	%rdx, %r12
00000000000a1283	movq	%r14, %rdi
00000000000a1286	callq	__ZNK16HGPixelBufferObj6formatEv ## HGPixelBufferObj::format() const
00000000000a128b	movl	%eax, %r13d
00000000000a128e	movq	%r14, %rdi
00000000000a1291	callq	__ZN16HGPixelBufferObj10GetDataPtrEv ## HGPixelBufferObj::GetDataPtr()
00000000000a1296	movq	%rax, %r15
00000000000a1299	movq	%r14, %rdi
00000000000a129c	callq	__ZNK16HGPixelBufferObj8rowBytesEv ## HGPixelBufferObj::rowBytes() const
00000000000a12a1	movl	%eax, %r9d
00000000000a12a4	movq	%rbx, %rdi
00000000000a12a7	movq	-0x30(%rbp), %rsi
00000000000a12ab	movq	%r12, %rdx
00000000000a12ae	movl	%r13d, %ecx
00000000000a12b1	movq	%r15, %r8
00000000000a12b4	callq	__ZN8HGBitmapC2E6HGRect8HGFormatPvm ## HGBitmap::HGBitmap(HGRect, HGFormat, void*, unsigned long)
00000000000a12b9	leaq	0x96a708(%rip), %rax
00000000000a12c0	movq	%rax, (%rbx)
00000000000a12c3	movq	%r14, 0x80(%rbx)
00000000000a12ca	movq	(%r14), %rax
00000000000a12cd	movq	%r14, %rdi
00000000000a12d0	callq	*0x10(%rax)
00000000000a12d3	addq	$0x8, %rsp
00000000000a12d7	popq	%rbx
00000000000a12d8	popq	%r12
00000000000a12da	popq	%r13
00000000000a12dc	popq	%r14
00000000000a12de	popq	%r15
00000000000a12e0	popq	%rbp
00000000000a12e1	retq
00000000000a12e2	movq	%rax, %r14
00000000000a12e5	movq	%rbx, %rdi
00000000000a12e8	callq	__ZN8HGBitmapD2Ev               ## HGBitmap::~HGBitmap()
00000000000a12ed	movq	%r14, %rdi
00000000000a12f0	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000a12f5	nopw	%cs:(%rax,%rax)
