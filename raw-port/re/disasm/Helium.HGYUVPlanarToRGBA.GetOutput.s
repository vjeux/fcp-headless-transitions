__ZN17HGYUVPlanarToRGBA9GetOutputEP10HGRenderer:
00000000000e51a0	pushq	%rbp
00000000000e51a1	movq	%rsp, %rbp
00000000000e51a4	pushq	%r15
00000000000e51a6	pushq	%r14
00000000000e51a8	pushq	%rbx
00000000000e51a9	pushq	%rax
00000000000e51aa	movq	%rdi, %rbx
00000000000e51ad	callq	__ZN17HGYUVPlanarToRGBA18GetOutputForPlanarEP10HGRenderer ## HGYUVPlanarToRGBA::GetOutputForPlanar(HGRenderer*)
00000000000e51b2	movq	%rax, %r14
00000000000e51b5	cmpb	$0x1, 0x1b0(%rbx)
00000000000e51bc	jne	0xe51ec
00000000000e51be	movq	%rbx, %rdi
00000000000e51c1	movq	%r14, %rdx
00000000000e51c4	callq	__ZN17HGYUVPlanarToRGBA18GetOutputForXRsRGBEP10HGRendererP6HGNode ## HGYUVPlanarToRGBA::GetOutputForXRsRGB(HGRenderer*, HGNode*)
00000000000e51c9	movq	%rax, %r15
00000000000e51cc	movq	0x198(%rbx), %rdi
00000000000e51d3	cmpq	%rax, %rdi
00000000000e51d6	je	0xe520c
00000000000e51d8	testq	%rdi, %rdi
00000000000e51db	je	0xe51e3
00000000000e51dd	movq	(%rdi), %rax
00000000000e51e0	callq	*0x18(%rax)
00000000000e51e3	movq	%r15, 0x198(%rbx)
00000000000e51ea	jmp	0xe521a
00000000000e51ec	movq	0x198(%rbx), %rdi
00000000000e51f3	cmpq	%r14, %rdi
00000000000e51f6	je	0xe5235
00000000000e51f8	testq	%rdi, %rdi
00000000000e51fb	je	0xe5203
00000000000e51fd	movq	(%rdi), %rax
00000000000e5200	callq	*0x18(%rax)
00000000000e5203	movq	%r14, 0x198(%rbx)
00000000000e520a	jmp	0xe5223
00000000000e520c	testq	%r15, %r15
00000000000e520f	je	0xe521a
00000000000e5211	movq	(%r15), %rax
00000000000e5214	movq	%r15, %rdi
00000000000e5217	callq	*0x18(%rax)
00000000000e521a	movq	(%r14), %rax
00000000000e521d	movq	%r14, %rdi
00000000000e5220	callq	*0x18(%rax)
00000000000e5223	movq	0x198(%rbx), %rax
00000000000e522a	addq	$0x8, %rsp
00000000000e522e	popq	%rbx
00000000000e522f	popq	%r14
00000000000e5231	popq	%r15
00000000000e5233	popq	%rbp
00000000000e5234	retq
00000000000e5235	testq	%r14, %r14
00000000000e5238	je	0xe5223
00000000000e523a	movq	(%r14), %rax
00000000000e523d	movq	%r14, %rdi
00000000000e5240	callq	*0x18(%rax)
00000000000e5243	jmp	0xe5223
00000000000e5245	movq	%rax, %rdi
00000000000e5248	callq	___clang_call_terminate
00000000000e524d	movq	%rax, %rdi
00000000000e5250	callq	___clang_call_terminate
00000000000e5255	movq	%rax, %rbx
00000000000e5258	testq	%r14, %r14
00000000000e525b	je	0xe5281
00000000000e525d	movq	(%r14), %rax
00000000000e5260	movq	%r14, %rdi
00000000000e5263	callq	*0x18(%rax)
00000000000e5266	jmp	0xe5281
00000000000e5268	movq	%rax, %rdi
00000000000e526b	callq	___clang_call_terminate
00000000000e5270	movq	%rax, %rbx
00000000000e5273	testq	%r15, %r15
00000000000e5276	je	0xe5281
00000000000e5278	movq	(%r15), %rax
00000000000e527b	movq	%r15, %rdi
00000000000e527e	callq	*0x18(%rax)
00000000000e5281	movq	%rbx, %rdi
00000000000e5284	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000e5289	movq	%rax, %rdi
00000000000e528c	callq	___clang_call_terminate
00000000000e5291	nopw	%cs:(%rax,%rax)
