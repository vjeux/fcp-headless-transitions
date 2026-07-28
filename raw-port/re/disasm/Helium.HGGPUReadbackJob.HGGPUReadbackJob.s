__ZN16HGGPUReadbackJobC1ERKNSt3__110shared_ptrIK18HGGPUComputeDeviceEEP12HGRenderNode:
0000000000108180	pushq	%rbp
0000000000108181	movq	%rsp, %rbp
0000000000108184	pushq	%r15
0000000000108186	pushq	%r14
0000000000108188	pushq	%rbx
0000000000108189	pushq	%rax
000000000010818a	movq	%rdx, %r14
000000000010818d	movq	%rsi, %r15
0000000000108190	movq	%rdi, %rbx
0000000000108193	callq	__ZN8HGObjectC2Ev               ## HGObject::HGObject()
0000000000108198	leaq	0x913061(%rip), %rax
000000000010819f	movq	%rax, (%rbx)
00000000001081a2	xorps	%xmm0, %xmm0
00000000001081a5	movups	%xmm0, 0x10(%rbx)
00000000001081a9	movq	(%r15), %rax
00000000001081ac	movq	0x8(%r15), %rcx
00000000001081b0	testq	%rcx, %rcx
00000000001081b3	je	0x1081f0
00000000001081b5	lock
00000000001081b6	incq	0x8(%rcx)
00000000001081ba	movq	0x18(%rbx), %r15
00000000001081be	movq	%rax, 0x10(%rbx)
00000000001081c2	movq	%rcx, 0x18(%rbx)
00000000001081c6	testq	%r15, %r15
00000000001081c9	je	0x1081fc
00000000001081cb	movq	$-0x1, %rax
00000000001081d2	lock
00000000001081d3	xaddq	%rax, 0x8(%r15)
00000000001081d8	testq	%rax, %rax
00000000001081db	jne	0x1081fc
00000000001081dd	movq	(%r15), %rax
00000000001081e0	movq	%r15, %rdi
00000000001081e3	callq	*0x10(%rax)
00000000001081e6	movq	%r15, %rdi
00000000001081e9	callq	0x3c4efe                        ## symbol stub for: __ZNSt3__119__shared_weak_count14__release_weakEv
00000000001081ee	jmp	0x1081fc
00000000001081f0	movq	%rax, 0x10(%rbx)
00000000001081f4	movq	$0x0, 0x18(%rbx)
00000000001081fc	leaq	0x10(%rbx), %r15
0000000000108200	movq	%r14, 0x20(%rbx)
0000000000108204	movq	(%r14), %rax
0000000000108207	movq	%r14, %rdi
000000000010820a	callq	*0x10(%rax)
000000000010820d	addq	$0x8, %rsp
0000000000108211	popq	%rbx
0000000000108212	popq	%r14
0000000000108214	popq	%r15
0000000000108216	popq	%rbp
0000000000108217	retq
0000000000108218	movq	%rax, %r14
000000000010821b	movq	%r15, %rdi
000000000010821e	callq	__ZNSt3__110shared_ptrIK18HGGPUComputeDeviceED1B9nqe210106Ev ## std::__1::shared_ptr<HGGPUComputeDevice const>::~shared_ptr[abi:nqe210106]()
0000000000108223	movq	%rbx, %rdi
0000000000108226	callq	__ZN8HGObjectD2Ev               ## HGObject::~HGObject()
000000000010822b	movq	%r14, %rdi
000000000010822e	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000108233	nopw	%cs:(%rax,%rax)
